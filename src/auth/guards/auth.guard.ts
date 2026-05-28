import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  // constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Thiếu token truy cập');
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'default_access_token_secret',
      ) as { userId: string; role: string };

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token truy cập không hợp lệ');
    }
    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
