import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { StatusCode } from "src/constants/status-code";
import { productService } from "src/service/product.service";
import { Product } from "src/types/types";

export const getProductById = async (event) => {
  console.log("'getProductById' lambda was called: ", event);

  try {
    const { productId } = event.pathParameters;
    const product: Product = await productService.getProductById(productId);

    if (product) {
      return formatJSONResponse(StatusCode.OK, product);
    }

    return formatJSONResponse(StatusCode.NOT_FOUND, {
      message: `Product not found`,
    });
  } catch (error) {
    return formatJSONResponse(StatusCode.INTERNAL_SERVER_ERROR, {
      message: `Internal server error`,
    });
  }
};

export const main = middyfy(getProductById);
