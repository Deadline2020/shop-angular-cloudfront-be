import { productBaseList } from "src/db/productBaseList";
import { productService } from "src/service/product.service";
import { getProductsList } from "./handler";

describe("getProductList", () => {
  it("should return a list of products", async () => {
    const eventMock = {};

    jest
      .spyOn(productService, "getProductsList")
      .mockImplementation(() => Promise.resolve(productBaseList));

    const result = await getProductsList(eventMock);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(productBaseList);
  });

  it("should return 404 if the list of products is empty", async () => {
    const eventMock = {};

    jest
      .spyOn(productService, "getProductsList")
      .mockImplementation(() => Promise.resolve([]));

    const result = await getProductsList(eventMock);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      message: `Products not found`,
    });
  });

  it("should return 500 if the request for the list of products was failed", async () => {
    const eventMock = {};

    jest.spyOn(productService, "getProductsList").mockImplementation(() => {
      throw new Error();
    });

    const result = await getProductsList(eventMock);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: `Internal server error`,
    });
  });
});
