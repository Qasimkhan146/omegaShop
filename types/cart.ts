// src/types/cart.ts
export interface CartItem {
  attributes: {
    title: string;
    price?: number | string;
    vatRate?: number | string;
    preOrder?: string;
    vatAmount?: number | string;
    discount?: number | string;
    finalPrice?: number | string;
    images?: string[];
  };
  quantity: number;
  id: string;
}
