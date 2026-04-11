export declare class MinioSignerService {
    private endpoint;
    private bucket;
    private secret;
    signUpload(objectKey: string, ttlSeconds: number): string;
    signDownload(objectKey: string, ttlSeconds: number): string;
    private buildSignedUrl;
}
