import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SessionModule } from '../session/session.module';
import { JwtModule } from '@nestjs/jwt';
import { PasswordModule } from 'src/passwords/password.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SessionModule,
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
