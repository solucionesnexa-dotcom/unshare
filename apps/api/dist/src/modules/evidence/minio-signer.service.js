"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioSignerService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let MinioSignerService = class MinioSignerService {
    constructor() {
        this.endpoint = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;
        this.bucket = process.env.MINIO_BUCKET || 'evidence-prod';
        this.secret = process.env.MINIO_SECRET_KEY || 'minio123';
    }
    signUpload(objectKey, ttlSeconds) {
        return this.buildSignedUrl('PUT', objectKey, ttlSeconds);
    }
    signDownload(objectKey, ttlSeconds) {
        return this.buildSignedUrl('GET', objectKey, ttlSeconds);
    }
    buildSignedUrl(method, objectKey, ttlSeconds) {
        const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
        const payload = `${method}:${this.bucket}:${objectKey}:${expires}`;
        const sig = (0, crypto_1.createHmac)('sha256', this.secret).update(payload).digest('hex');
        return `${this.endpoint}/${this.bucket}/${objectKey}?expires=${expires}&sig=${sig}&method=${method}`;
    }
};
exports.MinioSignerService = MinioSignerService;
exports.MinioSignerService = MinioSignerService = __decorate([
    (0, common_1.Injectable)()
], MinioSignerService);
//# sourceMappingURL=minio-signer.service.js.map