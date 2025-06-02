// utils/s3Util.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const bucket = process.env.S3_BUCKET_NAME;

// S3配置
const s3Config = {
    region: process.env.S3_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT, // 可选，兼容 minio 等自建服务
    forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE, // 兼容 minio
    bucket
};
// console.log('s3Config', s3Config);
const s3 = new S3Client(s3Config);



// 上传文件
export async function uploadFile({ key, body, contentType }) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    await s3.send(command);
    return { key, bucket };
}

// 获取文件下载链接（带签名）
export async function getFileUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
}

// 删除文件
export async function deleteFile(key) {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    await s3.send(command);
    return true;
}

// 获取文件列表
export async function listFiles(prefix = '') {
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    });
    const res = await s3.send(command);
    return res.Contents || [];
}