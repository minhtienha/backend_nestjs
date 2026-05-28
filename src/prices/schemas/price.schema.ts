import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PriceDocument = HydratedDocument<Price>;

@Schema()
export class Price {
  @Prop({ required: true, ref: 'Product' })
  productId: string;

  @Prop({ required: true })
  price: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);
