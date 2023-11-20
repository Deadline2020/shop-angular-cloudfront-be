import type { AWS } from "@serverless/typescript";

import {
  createProduct,
  getProductById,
  getProductsList,
  catalogBatchProcess,
} from "@functions/index";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PRODUCTS_TABLE_NAME: "Products",
      STOCKS_TABLE_NAME: "Stocks",
      SNS_ARN: {
        Ref: "createProductTopic",
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: [
          "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PRODUCTS_TABLE_NAME}",
          "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.STOCKS_TABLE_NAME}",
        ],
      },
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: {
          Ref: "createProductTopic",
        },
      },
    ],
  },
  functions: {
    getProductsList,
    getProductById,
    createProduct,
    catalogBatchProcess,
  },
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
  resources: {
    Resources: {
      products: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.PRODUCTS_TABLE_NAME}",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      stocks: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.STOCKS_TABLE_NAME}",
          AttributeDefinitions: [
            { AttributeName: "product_id", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "product_id", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      catalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      createProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductTopic",
        },
      },
      mainSNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "deadline2020@yandex.by",
          Protocol: "email",
          TopicArn: {
            Ref: "createProductTopic",
          },
        },
      },
      additionalSNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "burdalogin@yandex.by",
          Protocol: "email",
          TopicArn: {
            Ref: "createProductTopic",
          },
          FilterPolicy: {
            productPrice: [{ numeric: [">=", 300] }],
          },
        },
      },
    },
    Outputs: {
      sqsURL: {
        Value: { Ref: "catalogItemsQueue" },
        Export: {
          Name: "queueURL",
        },
      },
      sqsARN: {
        Value: { "Fn::GetAtt": ["catalogItemsQueue", "Arn"] },
        Export: {
          Name: "queueARN",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
