import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3EventRecord } from "aws-lambda";
import { Readable } from "stream";
import csv from "csv-parser";

export const importService = {
  getSignedUploadUrl: async (fileName: string) => {
    const client = new S3Client({ region: "eu-west-1" });
    const command = new PutObjectCommand({
      Bucket: process.env.IMPORT_BUCKET_NAME,
      Key: `${process.env.UPLOAD_FOLDER}/${fileName}`,
      ContentType: "text/csv",
    });

    return getSignedUrl(client, command, { expiresIn: 60 });
  },

  getParsedData: async (record: S3EventRecord) => {
    const client = new S3Client({ region: "eu-west-1" });

    const command = new GetObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    });

    const response = await client.send(command);
    const readStream = response.Body as Readable;

    const parsedData = await new Promise((resolve, reject) => {
      const result = [];
      readStream
        .pipe(csv())
        .on("data", (data) => {
          console.log("Record: ", data);
          result.push(data);
        })
        .on("end", () => {
          resolve(result);
        })
        .on("error", () => {
          reject(false);
        });
    });

    return parsedData;
  },

  moveFile: async (record: S3EventRecord) => {
    const client = new S3Client({ region: "eu-west-1" });
    const bucketName = record.s3.bucket.name;
    const key = record.s3.object.key;

    const copyCommand = new CopyObjectCommand({
      CopySource: `${bucketName}/${key}`,
      Bucket: bucketName,
      Key: key.replace(process.env.UPLOAD_FOLDER, process.env.PARSED_FOLDER),
    });
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(copyCommand);
    await client.send(deleteCommand);
  },
};
