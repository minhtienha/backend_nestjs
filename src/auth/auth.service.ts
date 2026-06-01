import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response, Request } from 'express';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Session, SessionDocument } from '../session/schemas/session.schema';
import {
  Password,
  PasswordDocument,
} from '../passwords/schemas/password.schema';

const ACCESS_TOKEN_TTL = '15s';
const REFRESH_TOKEN_TTL = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Password.name)
    private readonly passwordModel: Model<PasswordDocument>,
  ) {}

  // Hàm lấy secret key từ biến môi trường
  private getJwtSecret(key: 'ACCESS_TOKEN_SECRET' | 'REFRESH_TOKEN_SECRET') {
    const secret = process.env[key];
    if (!secret) {
      throw new BadRequestException('Thiếu cấu hình token secret');
    }
    return secret;
  }

  // Hàm tạo access token
  private signAccessToken(userId: string, role?: string) {
    return jwt.sign(
      { userId, role },
      this.getJwtSecret('ACCESS_TOKEN_SECRET'),
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
  }

  // Hàm tạo refresh token
  private signRefreshToken(userId: string) {
    return jwt.sign({ userId }, this.getJwtSecret('REFRESH_TOKEN_SECRET'), {
      expiresIn: REFRESH_TOKEN_TTL,
    });
  }

  // Hàm xác thực access token và lấy userId
  private verifyAccessToken(authorization: string | undefined) {
    if (!authorization) {
      throw new BadRequestException('Thiếu access token');
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : authorization;

    try {
      const payload = jwt.verify(
        token,
        this.getJwtSecret('ACCESS_TOKEN_SECRET'),
      ) as { userId: string; role: string };

      return payload.userId;
    } catch {
      throw new BadRequestException('Access token không hợp lệ');
    }
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).lean();

    if (existingUser) {
      throw new HttpException('Email đã tồn tại', 400);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({
      ...registerDto,
      email,
    });

    // Tạo bản ghi lịch sử mật khẩu
    await this.passwordModel.create({
      userId: user._id.toString(),
      currentPassword: hashedPassword,
      passwordHistory: [],
    });

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const email = loginDto.email?.toLowerCase();
    const password = loginDto.password;

    if (!email || !password) {
      throw new HttpException('Thiếu email hoặc password', 400);
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Email không tồn tại', 404);
    }
    const userPassword = await this.passwordModel
      .findOne({ userId: user._id.toString() })
      .select('currentPassword');

    if (!userPassword) {
      throw new HttpException('Mật khẩu hiện tại không đúng', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userPassword.currentPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException('Mật khẩu không chính xác', 400);
    }

    const accessToken = this.signAccessToken(user._id.toString(), user.role);
    const refreshToken = this.signRefreshToken(user._id.toString());

    // Lưu refresh token vào trong database (Session collection)
    await this.sessionModel.create({
      userId: user._id.toString(),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + COOKIE_MAX_AGE),
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: COOKIE_MAX_AGE,
    });

    return { accessToken, role: user.role };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.refreshToken) {
      throw new HttpException('Thiếu refresh token', 400);
    }

    try {
      const payload = jwt.verify(
        refreshTokenDto.refreshToken,
        this.getJwtSecret('REFRESH_TOKEN_SECRET'),
      ) as { userId: string; role: string };

      const session = await this.sessionModel.findOne({
        refreshToken: refreshTokenDto.refreshToken,
        userId: payload.userId,
      });

      if (!session) {
        throw new HttpException(
          'Phiên làm việc không tồn tại hoặc đã hết hạn',
          401,
        );
      }

      const accessToken = this.signAccessToken(payload.userId, payload.role);

      return { accessToken, role: payload.role };
    } catch {
      throw new HttpException('Refresh token không hợp lệ', 400);
    }
  }

  async changePassword(
    authorization: string | undefined,
    changePasswordDto: ChangePasswordDto,
  ) {
    const userId = this.verifyAccessToken(authorization);
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', 404);
    }

    const userPassword = await this.passwordModel
      .findOne({ userId: user._id.toString() })
      .select('currentPassword passwordHistory');

    if (!userPassword) {
      throw new HttpException('Mật khẩu người dùng không tồn tại', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      userPassword.currentPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException('Mật khẩu hiện tại không chính xác', 400);
    }

    const isSamePasswordCurrent = await bcrypt.compare(
      changePasswordDto.newPassword,
      userPassword.currentPassword,
    );

    if (isSamePasswordCurrent) {
      throw new HttpException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
        400,
      );
    }

    for (const historyItem of userPassword.passwordHistory) {
      const isMatch = await bcrypt.compare(
        changePasswordDto.newPassword,
        historyItem.hashedPassword,
      );
      if (isMatch) {
        throw new HttpException(
          'Mật khẩu mới đã được sử dụng trong 3 lần gần nhất, vui lòng chọn mật khẩu khác',
          400,
        );
      }
    }

    userPassword.passwordHistory.unshift({
      hashedPassword: userPassword.currentPassword,
      changedAt: new Date(),
    });

    if (userPassword.passwordHistory.length > 3) {
      userPassword.passwordHistory.pop();
    }

    userPassword.currentPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await userPassword.save();

    return { message: 'Đổi mật khẩu thành công' };
  }

  async logout(req: Request, res: Response) {
    const cookies = req.cookies as Record<string, string>;
    const refreshTokenInCookie = cookies['refreshToken'];

    console.log('Refresh token trong cookie:', refreshTokenInCookie);

    if (!refreshTokenInCookie) {
      throw new HttpException('Không tìm thấy refresh token trong cookie', 400);
    }

    await this.sessionModel.findOneAndDelete({
      refreshToken: refreshTokenInCookie,
    });
    res.clearCookie('refreshToken');
    return res.send({ message: 'Đăng xuất thành công', status: 204 });
  }
}
