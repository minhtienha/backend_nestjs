import { HttpException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument } from './schemas/cart.schema';
import mongoose from 'mongoose';

@Injectable()
export class CartsService {
  constructor(@InjectModel('Cart') private cartModel: Model<CartDocument>) {}

  async create(createCartDto: CreateCartDto): Promise<CartDocument> {
    const newCart = new this.cartModel(createCartDto);
    return newCart.save();
  }

  async findAll() {
    return this.cartModel.find();
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const cart = await this.cartModel.findById(id);
    if (!cart) {
      throw new HttpException('Giỏ hàng không tồn tại', 404);
    }
    return cart;
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const cart = await this.cartModel.findByIdAndUpdate(id, updateCartDto, {
      new: true,
    });
    if (!cart) {
      throw new HttpException('Giỏ hàng không tồn tại', 404);
    }
    return cart;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const cart = await this.cartModel.findByIdAndDelete(id);
    if (!cart) {
      throw new HttpException('Giỏ hàng không tồn tại', 404);
    }
    return cart;
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    } else {
      await this.cartModel.create({
        userId,
        items: [{ productId, quantity }],
      });
    }
  }
}
