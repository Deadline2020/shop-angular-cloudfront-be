import { productService } from "src/service/product.service";
import { createProduct } from "./handler";

describe("createProduct", () => {
  it("should return 201 if request is valid", async () => {
    const idMock = "ID";
    const validBodyMock = {
      title: "new product",
      price: 1000,
      count: 555,
      description: "new product description",
    };
    const expectedProduct = {
      id: idMock,
      title: validBodyMock.title,
      price: validBodyMock.price,
      count: validBodyMock.count,
      description: validBodyMock.description,
    };

    jest
      .spyOn(productService, "createProduct")
      .mockImplementation(() => Promise.resolve(expectedProduct));

    const result = await createProduct({ body: validBodyMock });

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual(expectedProduct);
  });

  it("should return 400 if request is invalid", async () => {
    const invalidBodyMock = {
      price: 1000,
      count: 555,
      description: "new product description",
    };

    const result = await createProduct({ body: invalidBodyMock });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: `Bad request`,
    });
  });

  it("should return 500 if the request to create new products was failed", async () => {
    const validBodyMock = {
      title: "new product",
      price: 1000,
      count: 555,
      description: "new product description",
    };
    
    jest.spyOn(productService, "createProduct").mockImplementation(() => {
      throw new Error();
    });

    const result = await createProduct({ body: validBodyMock });

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: `Internal server error`,
    });
  });
});
