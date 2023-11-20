export const authorizationService = {
  getDecodedTokenData: (token) => {
    const tokenData = Buffer.from(token, "base64").toString("utf-8").split(":");
    return tokenData;
  },

  getPolicy: (principalId, resource, effect) => {
    return {
      principalId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
          },
        ],
      },
    };
  },
};
