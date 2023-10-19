export interface Product {
  id: string;
  title: string;
  count: number;
  price: number;
  description: string;
}

export interface ResponseMessage {
  message: string;
}

export type ResponseType = ResponseMessage | Product | Product[];
