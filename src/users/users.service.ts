import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schemas/user.schema';
import { Model, QueryFilter } from 'mongoose';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async findAll(query: QueryUserDto): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<UserDocument> = {};

    if (query.keyword) {
      filter.$or = [
        {
          fullName: {
            $regex: query.keyword,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: query.keyword,
            $options: 'i',
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    if (!users.length) {
      throw new HttpException('Không có người dùng nào', 404);
    }

    return {
      data: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new HttpException('Người dùng không tồn tại', 404);
    }

    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
      })
      .lean();

    if (!user) {
      throw new HttpException('Người dùng không tồn tại', 404);
    }

    return new UserResponseDto(user);
  }

  async remove(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const result = await this.userModel.findByIdAndDelete(id).lean();

    if (!result) {
      throw new HttpException('Người dùng không tồn tại', 404);
    }

    return;
  }
}
