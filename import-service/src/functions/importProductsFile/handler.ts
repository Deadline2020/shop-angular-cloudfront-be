import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { StatusCode } from "src/constants/status-code";
import { importService } from "src/service/import.service";

export const importProductsFile = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("'importProductsFile' lambda was called: ", event);

  try {
    const { name } = event.queryStringParameters;

    if (!name) {
      return formatJSONResponse(StatusCode.BAD_REQUEST, {
        message: `Bad request`,
      });
    }

    const signedUrl: string = await importService.getSignedUploadUrl(name);

    return formatJSONResponse(StatusCode.OK, signedUrl);
  } catch (error) {
    return formatJSONResponse(StatusCode.INTERNAL_SERVER_ERROR, {
      message: `Internal server error`,
    });
  }
};

export const main = middyfy(importProductsFile);
