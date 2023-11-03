import { v4 as uuidv4 } from "uuid";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

import { productDB } from "src/db/product.database";
import { Product, ProductInDB, StockInDB } from "src/types/types";

export const productService = {
  getProductsList: async () => {
    const products = (await productDB.getTable(
      process.env.PRODUCTS_TABLE_NAME
    )) as ProductInDB[];
    const stocks = (await productDB.getTable(
      process.env.STOCKS_TABLE_NAME
    )) as StockInDB[];

    const joinedProducts: Product[] = products.map((product) => ({
      ...product,
      count: stocks.find((stock) => stock.product_id === product.id)?.count,
    }));

    return joinedProducts;
  },

  getProductById: async (id: string) => {
    const product = (await productDB.getItemByKey(
      process.env.PRODUCTS_TABLE_NAME,
      "id",
      id
    )) as ProductInDB;

    if (!product) {
      return null;
    }

    const stock = (await productDB.getItemByKey(
      process.env.STOCKS_TABLE_NAME,
      "product_id",
      id
    )) as StockInDB;

    const joinedProduct: Product = {
      ...product,
      count: stock?.count,
    };

    return joinedProduct;
  },

  createProduct: async (body: Omit<Product, "id">) => {
    const newProduct = await productDB.createProduct({
      id: uuidv4(),
      ...body,
    });

    return newProduct;
  },

  batchCreateProduct: async (products: Omit<Product, "id">[]) => {
    const productsWithID: Product[] = products.map((product) => ({
      id: uuidv4(),
      ...product,
    }));

    await productDB.batchCreateProduct(productsWithID);
  },

  sendMessages: async (products: Omit<Product, "id">[]) => {
    const snsClient = new SNSClient({ region: "eu-west-1" });

    for (const product of products) {
      const sqsCommand = new PublishCommand({
        Subject: `Product "${product.title}" was created`,
        Message: JSON.stringify(product),
        MessageAttributes: {
          productPrice: {
            DataType: "Number",
            StringValue: `${product.price}`,
          },
        },
        TopicArn: process.env.SNS_ARN,
      });

      await snsClient.send(sqsCommand);
    }
  },
};
