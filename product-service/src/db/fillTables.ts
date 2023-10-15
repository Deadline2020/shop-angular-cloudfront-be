import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import { productBaseList } from "./productBaseList";

const client = new DynamoDBClient({ region: "eu-west-1" });

const productRequestData = [];
const stockRequestData = [];

for (const item of productBaseList) {
  const productData = {
    PutRequest: {
      Item: {
        id: { S: item.id },
        title: { S: item.title },
        price: { N: item.price.toString() },
        description: { S: item.description },
      },
    },
  };

  productRequestData.push(productData);

  const stockData = {
    PutRequest: {
      Item: {
        product_id: { S: item.id },
        count: { N: item.count.toString() },
      },
    },
  };

  stockRequestData.push(stockData);
}

const request = {
  RequestItems: {
    Products: productRequestData,
    Stocks: stockRequestData,
  },
};

async function fillTables() {
  try {
    const command = new BatchWriteItemCommand(request);
    await client.send(command);
    console.log("Success, tables are filled");
  } catch (err) {
    console.log("Error", err);
  }
}

fillTables();
client.destroy();
