import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@Injectable()
export class ObjectStorageService {
  private readonly client: S3Client;
  private readonly bucket?: string;
  private readonly publicUrl?: string;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION') ?? 'ru-central1';
    this.bucket = this.configService.get<string>('S3_BUCKET');
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL');
    this.accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    this.secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
    );

    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials:
        this.accessKeyId && this.secretAccessKey
          ? {
              accessKeyId: this.accessKeyId,
              secretAccessKey: this.secretAccessKey,
            }
          : undefined,
    });
  }

  async upload(file: UploadedFile) {
    if (!this.bucket || !this.accessKeyId || !this.secretAccessKey) {
      throw new ServiceUnavailableException('S3 storage is not configured');
    }

    if (!file.buffer) {
      throw new InternalServerErrorException('Uploaded file buffer is empty');
    }

    const key = this.createKey(file.originalname);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: this.createUrl(key),
    };
  }

  private createKey(originalName: string) {
    return `uploads/${randomUUID()}${extname(originalName).toLowerCase()}`;
  }

  private createUrl(key: string) {
    if (!this.publicUrl) {
      return key;
    }

    return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
  }
}
