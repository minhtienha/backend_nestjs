import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-+_=])[A-Za-z\d!@#$%^&*()-+_=]{6,}$/,
    {
      message:
        'Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm cả chữ cái thường, chữ cái hoa, số và ký tự đặc biệt',
    },
  )
  newPassword: string;
}
