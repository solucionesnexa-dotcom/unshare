import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class MinioSignerService {
  private endpoint = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;
  private bucket = process.env.MINIO_BUCKET || 'evidence-prod';
  private secret = process.env.MINIO_SECRET_KEY || 'minio123';

  signUpload(objectKey: string, ttlSeconds: number) {
    return this.buildSignedUrl('PUT', objectKey, ttlSeconds);
  }

  signDownload(objectKey: string, ttlSeconds: number) {
    return this.buildSignedUrl('GET', objectKey, ttlSeconds);
  }

  private buildSignedUrl(method: 'PUT' | 'GET', objectKey: string, ttlSeconds: number) {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const payload = `${method}:${this.bucket}:${objectKey}:${expires}`;
    const sig = createHmac('sha256', this.secret).update(payload).digest('hex');
    return `${this.endpoint}/${this.bucket}/${objectKey}?expires=${expires}&sig=${sig}&method=${method}`;
  }
}
