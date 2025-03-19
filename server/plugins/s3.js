const StoragePlugin = require("./storage-plugin");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const fs = require("fs");

class S3Plugin extends StoragePlugin {
  s3 = null;
  constructor(config) {
    super(config, [ "region", "accessKeyId", "secretAccessKey", "endpoint", "bucketName" ]);
    this.s3 = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
        endpoint: this.config.endpoint,
      });
  }

  async upload(key, fileStream) {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
      Body: fileStream,
    };
    const command = new PutObjectCommand(params);
    const data = await this.s3.send(command);
    return data.ETag;
  }


  async download(fileId, fileStream) {
    const params = {
      Bucket: this.config.bucketName,
      Key: fileId,
    };
    const command = new GetObjectCommand(params);
    const data = await this.s3.send(command);
    data.Body.pipe(fileStream);
    return new Promise((resolve, reject) => {
      data.Body.on("end", () => {
        resolve();
      });
      data.Body.on("error", (err) => {
        reject(err);
      });
    });
  }

  async delete(fileId) {
    const params = {
      Bucket: this.config.bucketName,
      Key: fileId,
    };
    const command = new DeleteObjectCommand(params);
    const data = await this.s3.send(command);
    return data.$metadata.httpStatusCode === 204; 
  }
}

module.exports = S3Plugin;
