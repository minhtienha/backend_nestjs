import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Password, PasswordSchema } from './schemas/password.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Password.name, schema: PasswordSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PasswordModule {}
