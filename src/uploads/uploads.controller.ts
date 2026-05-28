import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Delete,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';

import { UploadsService } from './uploads.service';

import { Response } from 'express';

import { ObjectId } from 'mongodb';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const bucket = this.uploadsService.getBucket();

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      uploadStream.end(file.buffer);

      uploadStream.on('finish', (result) => {
        resolve(result);
      });

      uploadStream.on('error', reject);
    });
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const bucket = this.uploadsService.getBucket();

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    downloadStream.pipe(res);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.uploadsService.deleteFile(id);

    return {
      message: 'Deleted successfully',
    };
  }
}
