import { productDB } from "src/db/productDB";

export const productService = {
  getProductsList: () => Promise.resolve(productDB),
  getProductById: (id: string) =>
    Promise.resolve(productDB.find((product) => product.id === id)),
};
