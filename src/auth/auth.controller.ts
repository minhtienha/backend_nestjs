import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Headers,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('refresh')
  refresh(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    return this.authService.refresh(body, res);
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  changePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(authorization, body);
  }
}
