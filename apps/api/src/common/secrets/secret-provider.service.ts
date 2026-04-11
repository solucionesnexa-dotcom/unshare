import { Injectable } from '@nestjs/common';

@Injectable()
export class SecretProviderService {
  // Production boundary: replace with Vault client implementation.
  // MVP fallback uses environment variables.
  get(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing secret: ${name}`);
    return value;
  }
}
