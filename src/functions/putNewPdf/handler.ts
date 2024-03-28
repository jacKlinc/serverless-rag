import { Handler } from 'aws-lambda';
import { S3Event } from 'aws-lambda-types';
import { KendraClient, BatchPutDocumentCommand } from '@aws-sdk/client-kendra';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const serviceName = process.env.SERVICE_NAME
const stage = process.env.STAGE
const region = process.env.REGION

const kendraClient = new KendraClient({ region });
const s3Client = new S3Client({ region });

const KENDRA_INDEX_ID = `${serviceName}-${stage}-index`;
const S3_BUCKET_NAME = `${serviceName}-${stage}-pdfs`;

export const handler: Handler = async (event: S3Event) => {
  try {
    const promises = event.Records.map(async (record) => {
      const pdfKey = record.s3.object.key;
      const pdfData = await s3Client.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: pdfKey,
        })
      );

      const putDocumentCommand = new BatchPutDocumentCommand({
        IndexId: KENDRA_INDEX_ID,
        Documents: [
          {
            Id: pdfKey, // Use the S3 object key as the document ID
            ContentType: 'PDF',
            Blob: await pdfData.Body.transformToByteArray(),
          },
        ],
      });

      await kendraClient.send(putDocumentCommand);
    });

    await Promise.all(promises);

    console.log('PDF documents ingested successfully.');
  } catch (error) {
    console.error('Error ingesting PDF documents:', error);
  }
};