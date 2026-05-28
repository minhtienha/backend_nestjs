import { UserRole } from 'src/users/schemas/user.schema';
import {
  IsString,
  IsEnum,
  IsOptional,
  Matches,
  IsEmail,
  MinLength,
} from 'class-validator';
export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-+_=])[A-Za-z\d!@#$%^&*()-+_=]{6,}$/,
    {
      message:
        'Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ cái thường, chữ cái hoa, số và ký tự đặc biệt',
    },
  )
  password: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Số điện thoại phải có từ 10 chữ số' })
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole.USER;
}
