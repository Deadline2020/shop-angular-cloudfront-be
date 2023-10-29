import type { AWS } from "@serverless/typescript";

import { importFileParser, importProductsFile } from "@functions/index";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    stage: "dev",
    httpApi: {
      cors: true,
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      IMPORT_BUCKET_NAME: "manga-world-dag-aws-import-service-bucket",
      UPLOAD_FOLDER: "uploaded",
      PARSED_FOLDER: "parsed",
      QUEUE_URL: {
        "Fn::ImportValue": "queueURL",
      },
      QUEUE_ARN: {
        "Fn::ImportValue": "queueARN",
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource:
          "arn:aws:s3:::${self:provider.environment.IMPORT_BUCKET_NAME}",
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource:
          "arn:aws:s3:::${self:provider.environment.IMPORT_BUCKET_NAME}/*",
      },
      {
        Effect: "Allow",
        Action: ["sqs:*"],
        Resource: "${self:provider.environment.QUEUE_ARN}",
      },
    ],
  },
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
