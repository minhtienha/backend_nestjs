import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StockDocument = HydratedDocument<Stock>;

@Schema({ timestamps: true })
export class Stock {
  @Prop({ required: true, ref: 'Product' })
  productId: string;

  @Prop({ required: true })
  quantity: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
