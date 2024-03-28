import 'dotenv/config';
import type { AWS } from '@serverless/typescript';

import { setData, listenToStream, chatBot, putNewPdf } from '@functions/index';
import dynamoResources from '@resources/dynamoResources';
import kendraResources from '@resources/kendraResources';
import s3Resources from '@resources/s3Resources';

const serverlessConfiguration: AWS = {
  service: process.env.SERVICE_NAME,
  frameworkVersion: '3',
  custom: {
    myTable: '${sls:stage}-my-table',
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
      packager: 'npm',
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-webpack'],
  provider: {
    name: 'aws',
    stage: process.env.STAGE,
    runtime: 'nodejs16.x',
    // @ts-ignore
    region: process.env.REGION, 
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      myTable: '${self:custom.myTable}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*',
        Resource: [
          'arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.myTable}',
        ],
      },
      {
        Effect: 'Allow',
        Action: [
          'kendra:CreateIndex',
          'kendra:DescribeIndex',
          'kendra:QueryContext',
          'kendra:Query',
          's3:GetObject',
          's3:ListBucket',
        ],
        Resource: ['*'],
      },
    ],
  },
  functions: { setData, listenToStream, chatBot, putNewPdf },
  resources: {
    Resources: {
      ...dynamoResources, ...kendraResources, ...s3Resources
    }
  },
  package: { individually: true },
};

module.exports = serverlessConfiguration;
