export interface ProductInDB {
  id: string;
  title: string;
  price: number;
  description: string;
}
export interface StockInDB {
  product_id: string;
  count: number;
}
export interface Product extends ProductInDB {
  count: number;
}

export interface ResponseMessage {
  message: string;
}

export type ResponseType = ResponseMessage | Product | Product[];
