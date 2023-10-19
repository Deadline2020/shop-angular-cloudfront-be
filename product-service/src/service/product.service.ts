import { v4 as uuidv4 } from "uuid";

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
    const id: string = uuidv4();
    const { title, price, count, description } = body;

    const newProduct = await productDB.createProduct(
      id,
      title,
      price,
      count,
      description,
      process.env.PRODUCTS_TABLE_NAME,
      process.env.STOCKS_TABLE_NAME
    );

    return newProduct;
  },
};
