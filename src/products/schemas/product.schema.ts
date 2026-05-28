import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, ref: 'Category' })
  categoryId: string;

  @Prop()
  description: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
