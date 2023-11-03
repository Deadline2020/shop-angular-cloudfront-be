import { SQSEvent } from "aws-lambda";
import * as uuid from "uuid";
jest.mock("uuid");

import { productService } from "src/service/product.service";
import { productDB } from "src/db/product.database";
import { catalogBatchProcess } from "./handler";

describe("catalogBatchProcess", () => {
  it("should add products to the database and send messages if all goes successfully", async () => {
    const idMock = "new ID";
    const bodyMock = {
      title: "new product",
      price: 1000,
      count: 555,
      description: "new product description",
    };
    const recordsMock = [
      {
        body: JSON.stringify(bodyMock),
      },
    ];
    const expectedProducts = [
      {
        id: idMock,
        title: bodyMock.title,
        price: bodyMock.price,
        count: bodyMock.count,
        description: bodyMock.description,
      },
    ];

    jest.spyOn(uuid, "v4").mockImplementation(() => idMock);
    jest
      .spyOn(productDB, "batchCreateProduct")
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(productService, "sendMessages")
      .mockImplementation(() => Promise.resolve());

    await catalogBatchProcess({
      Records: recordsMock,
    } as unknown as SQSEvent);

    expect(productDB.batchCreateProduct).toHaveBeenCalledWith(expectedProducts);
    expect(productService.sendMessages).toHaveBeenCalledWith([bodyMock]);
  });

  it("should call log with error message if the request to create new products was failed", async () => {
    const bodyMock = {
      title: "new product",
      price: 1000,
      count: 555,
      description: "new product description",
    };
    const recordsMock = [
      {
        body: JSON.stringify(bodyMock),
      },
    ];

    jest.spyOn(productDB, "batchCreateProduct").mockImplementation(() => {
      throw new Error();
    });
    jest.spyOn(productService, "sendMessages").mockImplementation(() => {
      throw new Error();
    });
    jest.spyOn(console, "log").mockImplementation(() => {});

    await catalogBatchProcess({
      Records: recordsMock,
    } as unknown as SQSEvent);

    expect(console.log).toHaveBeenCalledWith(
      "Internal server error",
      new Error()
    );
  });
});
