const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'q7sZX6jQCrzTzhFY31Jh',
  secretKey: process.env.MINIO_SECRET_KEY || '2S9AmIDETfRMTvs2zEjdq1XlIIRq9kE1nNmiFtl9',
});

const bucketName = process.env.MINIO_BUCKET || 'songs-bucket';

const initializeMinIO = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} đã được tạo.`);
    }
  } catch (error) {
    console.error('Lỗi khi khởi tạo MinIO:', error);
    throw new Error('Không thể khởi tạo MinIO');
  }
};

module.exports = { minioClient, bucketName, initializeMinIO };