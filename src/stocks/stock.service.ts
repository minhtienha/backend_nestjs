import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { StockDocument } from './schemas/stock.schema';
@Injectable()
export class StockService {
  constructor(@InjectModel('Stock') private stockModel: Model<StockDocument>) {}

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 400);
    }
    const stockDoc = await this.stockModel.findById(id);
    if (!stockDoc) {
      throw new HttpException(
        'Không tìm thấy mã số lượng tồn kho của sản phẩm',
        404,
      );
    }
    stockDoc.quantity = quantity;
    await stockDoc.save();
    return { message: 'Cập nhật số lượng tồn kho thành công' };
  }
}
