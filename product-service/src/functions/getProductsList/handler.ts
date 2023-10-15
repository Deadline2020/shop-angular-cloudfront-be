import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { StatusCode } from "src/constants/status-code";
import { productService } from "src/service/product.service";
import { Product } from "src/types/types";

export const getProductsList = async (event) => {
  console.log("'getProductsList' lambda was called: ", event);

  try {
    const products: Product[] = await productService.getProductsList();

    if (products.length) {
      return formatJSONResponse(StatusCode.OK, products);
    }

    return formatJSONResponse(StatusCode.NOT_FOUND, {
      message: `Products not found`,
    });
  } catch (error) {
    return formatJSONResponse(StatusCode.INTERNAL_SERVER_ERROR, {
      message: `Internal server error`,
    });
  }
};

export const main = middyfy(getProductsList);
