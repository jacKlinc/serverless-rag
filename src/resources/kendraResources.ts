import type { AWS } from '@serverless/typescript';

const kendraResources: AWS['resources']['Resources'] = {
  KendraIndex: {
    Type: 'AWS::Kendra::Index',
    Properties: {
      Name: '${self:service}-${self:provider.stage}-index',
      RoleArn: {
        'Fn::GetAtt': ['KendraIndexRole', 'Arn'],
      },
      Description: 'Amazon Kendra Index for the RAG chatbot app',
      EditionConfiguration: {
        EditionType: 'DEVELOPER_EDITION',
      },
    },
  },
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
      ManagedPolicyArns: [
        'arn:aws:iam::aws:policy/AmazonKendraReadOnlyAccess',
        'arn:aws:iam::aws:policy/AmazonKendraFreeQueryAccess',
      ],
    },
  },
  KendraDataSource: {
    Type: 'AWS::Kendra::DataSource',
    Properties: {
      IndexId: {
        'Fn::Ref': 'KendraIndex',
      },
      Type: 'S3',
      DataSourceConfiguration: {
        S3Configuration: {
          BucketName: {
            'Fn::Ref': 'S3BucketForPDFs',
          },
        },
      },
      RoleArn: {
        'Fn::GetAtt': ['KendraIndexRole', 'Arn'],
      },
    },
  }
}
export default kendraResources;
