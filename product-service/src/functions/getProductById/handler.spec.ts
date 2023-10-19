import { productDB } from "src/db/productDB";
import { productService } from "src/service/productService";
import { getProductById } from "./handler";

describe("getProductById", () => {
  it("should return correct product", async () => {
    jest
      .spyOn(productService, "getProductById")
      .mockImplementation((id) =>
        Promise.resolve(productDB.find((product) => product.id === id))
      );

    const eventMock = { pathParameters: { productId: "1" } };
    const result = await getProductById(eventMock);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(productDB[0]);
  });

  it("should return 404 if the product is not found", async () => {
    jest
      .spyOn(productService, "getProductById")
      .mockImplementation((id) =>
        Promise.resolve(productDB.find((product) => product.id === id))
      );

    const eventMock = { pathParameters: { productId: "non-existent ID" } };
    const result = await getProductById(eventMock);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      message: `Product not found`,
    });
  });

  it("should return 500 if the request for the product was failed", async () => {
    jest.spyOn(productService, "getProductById").mockImplementation(() => {
      throw new Error();
    });

    const eventMock = { pathParameters: { productId: "1" } };
    const result = await getProductById(eventMock);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: `Internal server error`,
    });
  });
});
