import { object, string, number } from "yup";

import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { StatusCode } from "src/constants/status-code";
import { productService } from "src/service/product.service";
import { Product } from "src/types/types";

const bodySchema = object({
  title: string().required(),
  price: number(),
  count: number(),
  description: string(),
});

export const createProduct = async (event) => {
  console.log("'createProduct' lambda was called: ", event);

  const isValidBody = await bodySchema.isValid(event.body);

  if (!isValidBody) {
    return formatJSONResponse(StatusCode.BAD_REQUEST, {
      message: `Bad request`,
    });
  }

  try {
    const product: Product = await productService.createProduct(event.body);
    return formatJSONResponse(StatusCode.CREATED, product);
  } catch (error) {
    return formatJSONResponse(StatusCode.INTERNAL_SERVER_ERROR, {
      message: `Internal server error`,
    });
  }
};

export const main = middyfy(createProduct);
