import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type PasswordDocument = HydratedDocument<Password>;

@Schema({ _id: false })
export class PasswordHistoryItem {
  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ required: true })
  changedAt: Date;
}

@Schema({ timestamps: true })
export class Password {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  currentPassword: string;

  @Prop({ type: [PasswordHistoryItem], default: [] })
  passwordHistory: PasswordHistoryItem[];
}

export const PasswordSchema = SchemaFactory.createForClass(Password);
