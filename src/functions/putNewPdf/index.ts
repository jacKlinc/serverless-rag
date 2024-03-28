import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: '${self:resources.Resources.S3BucketForPDFs.Properties.BucketName}',
        event: 's3:ObjectCreated:*',
        existing: true,
      },
    },
  ],
};
