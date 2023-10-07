import { productDB } from "src/db/productDB";
import { productService } from "src/service/productService";
import { getProductsList } from "./handler";

describe("getProductList", () => {
  it("should return a list of products", async () => {
    jest
      .spyOn(productService, "getProductsList")
      .mockImplementation(() => Promise.resolve(productDB));

    const result = await getProductsList();

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(productDB);
  });

  it("should return 404 if the list of products is empty", async () => {
    jest
      .spyOn(productService, "getProductsList")
      .mockImplementation(() => Promise.resolve([]));

    const result = await getProductsList();

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      message: `Products not found`,
    });
  });

  it("should return 500 if the request for the list of products was failed", async () => {
    jest.spyOn(productService, "getProductsList").mockImplementation(() => {
      throw new Error();
    });

    const result = await getProductsList();

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: `Internal server error`,
    });
  });
});
