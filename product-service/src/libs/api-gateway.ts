import { StatusCode } from "src/constants/status-code";
import { ResponseType } from "src/types/types";

export const formatJSONResponse = (
  statusCode: StatusCode,
  response: ResponseType
) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};
