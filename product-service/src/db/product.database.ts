import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(client);

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

  createProduct: async (
    id: string,
    title: string,
    price: number,
    count: number,
    description: string,
    productsTableName: string,
    stocksTableName: string
  ) => {
    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            Item: {
              id,
              title,
              description,
              price,
            },
            TableName: productsTableName,
          },
        },
        {
          Put: {
            Item: {
              product_id: id,
              count,
            },
            TableName: stocksTableName,
          },
        },
      ],
    });

    await docClient.send(command);

    return { id, title, price, count, description };
  },
};
