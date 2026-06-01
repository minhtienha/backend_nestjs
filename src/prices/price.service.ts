import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { PriceDocument } from './schemas/price.schema';
@Injectable()
export class PriceService {
  constructor(@InjectModel('Price') private priceModel: Model<PriceDocument>) {}

  async updatePrice(id: string, price: number): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 400);
    }
    const priceDoc = await this.priceModel.findById(id);
    if (!priceDoc) {
      throw new HttpException('Không tìm thấy sản phẩm cần cập nhật giá', 404);
    }
    if (price < 0) {
      throw new HttpException('Giá phải là một số dương hợp lệ', 400);
    }
    if (priceDoc.price === price) {
      return { message: 'Giá không thay đổi, không cần cập nhật' };
    }
    priceDoc.price = price;
    await priceDoc.save();
    return { message: 'Cập nhật giá thành công' };
  }
}
