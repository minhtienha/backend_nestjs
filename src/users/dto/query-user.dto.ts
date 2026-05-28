import { IsOptional, IsString } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  keyword?: string;
}
