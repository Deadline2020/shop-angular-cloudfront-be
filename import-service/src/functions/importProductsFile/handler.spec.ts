import { importService } from "src/service/import.service";
import { importProductsFile } from "./handler";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("importProductsFile", () => {
  it("should return 200 and signed URL if request is valid", async () => {
    const validEvent = {
      queryStringParameters: {
        name: "test_name",
      },
    } as unknown as APIGatewayProxyEvent;

    const signedURL = "signed_url";

    jest
      .spyOn(importService, "getSignedUploadUrl")
      .mockImplementation(() => Promise.resolve(signedURL));

    const result = await importProductsFile(validEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(signedURL);
  });

  it("should return 400 if name is undefined", async () => {
    const invalidEvent = {
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent;

    const result = await importProductsFile(invalidEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: `Bad request`,
    });
  });

  it("should return 500 if the request for the signed URL was failed", async () => {
    const validEvent = {
      queryStringParameters: {
        name: "test_name",
      },
    } as unknown as APIGatewayProxyEvent;

    jest.spyOn(importService, "getSignedUploadUrl").mockImplementation(() => {
      throw new Error();
    });

    const result = await importProductsFile(validEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: `Internal server error`,
    });
  });
});
