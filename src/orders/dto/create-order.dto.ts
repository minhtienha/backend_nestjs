import {
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsString,
  IsPositive,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsPositive()
  price: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsPositive()
  totalAmount: number;

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
