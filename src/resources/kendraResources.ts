import type { AWS } from '@serverless/typescript';

const role = { 'Fn::GetAtt': ['KendraIndexRole', 'Arn'] }


const kendraResources: AWS['resources']['Resources'] = {
  KendraIndexRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'kendra.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      },
      // ManagedPolicyArns: [
      //   'arn:aws:iam::aws:policy/AmazonKendraReadOnlyAccess',
      //   'arn:aws:iam::aws:policy/AmazonKendraFreeQueryAccess',
      // ],
    },
  },
  KendraIndex: {
    Type: 'AWS::Kendra::Index',
    Properties: {
      Name: '${self:service}-${self:provider.stage}-index',
      RoleArn: role,
      Description: 'Amazon Kendra Index for the RAG chatbot app',
      Edition: 'DEVELOPER_EDITION',
    },
  },
  KendraDataSource: {
    Type: 'AWS::Kendra::DataSource',
    Properties: {
      Name: "KendraDataSource",
      IndexId: { Ref: 'KendraIndex' },
      Type: 'S3',
      DataSourceConfiguration: {
        S3Configuration: {
          BucketName: {
            Ref: 'S3BucketForPDFs',
          },
        },
      },
      RoleArn: role,
    },
  }
}
export default kendraResources;
