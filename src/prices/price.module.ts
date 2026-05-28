import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Price, PriceSchema } from './schemas/price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }]),
  ],
  exports: [MongooseModule],
})
export class PricesModule {}
