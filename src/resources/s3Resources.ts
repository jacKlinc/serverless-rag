import type { AWS } from '@serverless/typescript';

const s3Resources: AWS['resources']['Resources'] = {
  S3BucketForPDFs: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: '${self:service}-${self:provider.stage}-pdfs',
    },
  },
}
export default s3Resources;
