import { HttpException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDocument } from './schemas/order.schema';
import { CartDocument } from '../carts/schemas/cart.schema';
import { StockDocument } from '../stocks/schemas/stock.schema';
import mongoose from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private orderModel: Model<OrderDocument>,
    @InjectModel('Cart') private cartModel: Model<CartDocument>,
    @InjectModel('Stock') private stockModel: Model<StockDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    try {
      for (const item of createOrderDto.orderItems) {
        const updateStock = await this.stockModel.findOneAndUpdate(
          {
            productId: item.productId,
            quantity: { $gte: item.quantity },
          },
          {
            $inc: { quantity: -item.quantity },
          },
        );
        if (!updateStock) {
          throw new HttpException(
            `Sản phẩm ${item.productName} không đủ hàng`,
            400,
          );
        }
      }

      const createdOrder = new this.orderModel(createOrderDto);
      await createdOrder.save();

      await this.cartModel.findOneAndDelete({ userId: createOrderDto.userId });
      return createdOrder;
    } catch (error) {
      throw new HttpException(
        (error as string) || 'Tạo đơn hàng thất bại',
        400,
      );
    }
  }

  findAll(page, limit, search) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { userId: { $regex: search as string, $options: 'i' } },
            { fullName: { $regex: search as string, $options: 'i' } },
          ],
        }
      : {};
    return this.orderModel
      .find(query)
      .populate('userId')
      .populate('orderItems.productId')
      .skip(skip)
      .limit(+limit);
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const order = await this.orderModel
      .findById(id)
      .populate('userId')
      .populate('orderItems.productId');
    if (!order) {
      throw new HttpException('Đơn hàng không tồn tại', 404);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true,
    });
    if (!order) {
      throw new HttpException('Đơn hàng không tồn tại', 404);
    }
    return order;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const order = await this.orderModel.findByIdAndDelete(id);
    if (!order) {
      throw new HttpException('Đơn hàng không tồn tại', 404);
    }
    return order;
  }
}
