import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";

import { authorizationService } from "src/service/authorization.service";

export const basicAuthorizer = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const { headers, methodArn } = event;

  if (!headers.Authorization) {
    throw new Error("Unauthorized");
  }

  try {
    const token = headers.Authorization.split(" ")[1];
    const [login, password] = authorizationService.getDecodedTokenData(token);

    const validPassword = process.env[login];

    const checkResult =
      validPassword && validPassword === password ? "Allow" : "Deny";

    return authorizationService.getPolicy(token, methodArn, checkResult);
  } catch (error) {
    console.log(error);
  }
};
