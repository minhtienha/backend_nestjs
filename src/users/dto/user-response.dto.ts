export class UserResponseDto {
  id: string;
  email: string;
  fullName: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
