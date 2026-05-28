import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'đang chờ',
  SHIPPING = 'đang giao',
  COMPLETED = 'hoàn thành',
  CANCELLED = 'đã hủy',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true, ref: 'Product' })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 0 })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ type: [OrderItemSchema], required: true })
  orderItems: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
