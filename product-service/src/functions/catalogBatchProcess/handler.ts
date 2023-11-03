import { SQSEvent } from "aws-lambda";

import { productService } from "src/service/product.service";
import { Product } from "src/types/types";

export const catalogBatchProcess = async (event: SQSEvent) => {
  console.log("'catalogBatchProcess' lambda was called: ", event);

  const parsedRecords: Omit<Product, "id">[] = [];

  for (const record of event.Records) {
    const body: Omit<Product, "id"> = JSON.parse(record.body);
    parsedRecords.push(body);
  }

  try {
    await productService.batchCreateProduct(parsedRecords);
    await productService.sendMessages(parsedRecords);
  } catch (error) {
    console.log(`Internal server error`, error);
  }
};
