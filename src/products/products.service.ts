import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument } from './schemas/product.schema';
import { StockDocument } from '../stocks/schemas/stock.schema';
import { PriceDocument } from '../prices/schemas/price.schema';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private productModel: Model<ProductDocument>,
    @InjectModel('Stock') private stockModel: Model<StockDocument>,
    @InjectModel('Price') private priceModel: Model<PriceDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const trimmedName = createProductDto.name.trim();

    const isProductExist = await this.productModel.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (isProductExist) {
      throw new HttpException('Sản phẩm đã tồn tại', 400);
    }

    const { stock, price, ...productData } = createProductDto;

    const newProduct = new this.productModel({
      ...productData,
      name: trimmedName,
    });
    const savedProduct = await newProduct.save();

    const stockModel = new this.stockModel({
      productId: savedProduct._id,
      quantity: stock || 0,
    });
    await stockModel.save();

    const priceModel = new this.priceModel({
      productId: savedProduct._id,
      price: price,
    });
    await priceModel.save();

    return savedProduct;
  }

  async findAll(page, limit, search) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          name: { $regex: search as string, $options: 'i' },
        }
      : {};

    const products = await this.productModel
      .find(query)
      .skip(skip)
      .limit(+limit);

    if (!products.length) {
      throw new HttpException('Không tìm thấy sản phẩm nào', 404);
    }

    return products;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', 404);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      {
        new: true,
      },
    );
    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', 404);
    }
    return product;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const product = await this.productModel.findById(id).select('name');

    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', 404);
    }

    await this.productModel.findByIdAndDelete(id);

    return {
      message: `Sản phẩm ${product.name} đã được xóa thành công`,
    };
  }
}
