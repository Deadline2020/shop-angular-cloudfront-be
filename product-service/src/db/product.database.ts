import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { Product } from "src/types/types";

const client = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(client);

const getTransactItems = (products: Product[]) => {
  const result = [];

  for (const product of products) {
    const { id, title, price, count, description } = product;
    result.push(
      {
        Put: {
          Item: {
            id,
            title,
            description,
            price,
          },
          TableName: process.env.PRODUCTS_TABLE_NAME,
        },
      },
      {
        Put: {
          Item: {
            product_id: id,
            count,
          },
          TableName: process.env.STOCKS_TABLE_NAME,
        },
      }
    );
  }

  return result;
};

export const productDB = {
  getTable: async (tableName: string) => {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const response = (await docClient.send(command)).Items;

    return response;
  },

  getItemByKey: async (tableName: string, key: string, value: string) => {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        [key]: value,
      },
    });

    const response = (await docClient.send(command)).Item;

    return response;
  },

  createProduct: async (data: Product) => {
    const command = new TransactWriteCommand({
      TransactItems: getTransactItems([data]),
    });

    await docClient.send(command);

    return data;
  },

  batchCreateProduct: async (products: Product[]) => {
    const command = new TransactWriteCommand({
      TransactItems: getTransactItems(products),
    });

    await docClient.send(command);
  },
};
