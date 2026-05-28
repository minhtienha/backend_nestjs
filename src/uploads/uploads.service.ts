import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class UploadsService {
  private bucket: GridFSBucket;

  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  onModuleInit() {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  getBucket() {
    return this.bucket;
  }

  async deleteFile(id: string) {
    return this.bucket.delete(new ObjectId(id));
  }
}
