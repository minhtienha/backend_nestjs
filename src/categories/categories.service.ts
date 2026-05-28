import { HttpException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  findAll(page, limit, search) {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          name: { $regex: search as string, $options: 'i' },
        }
      : {};
    return this.categoryModel
      .find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(+limit);
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new HttpException('Danh mục không tồn tại', 404);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
      },
    );
    if (!category) {
      throw new HttpException('Danh mục không tồn tại', 404);
    }
    return category;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID không hợp lệ', 404);
    }
    const category = await this.categoryModel.findById(id).select('name');
    if (!category) {
      throw new HttpException('Danh mục không tồn tại', 404);
    }
    await this.categoryModel.findByIdAndDelete(id);
    return {
      message: `Danh mục ${category.name} đã được xóa thành công`,
    };
  }
}
