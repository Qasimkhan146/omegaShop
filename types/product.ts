export interface ProductAttributes {
  // Define the expected fields inside `attributes`, e.g.:
  title: string;
  description: string;
  price: number;
  vatAmount: number;
  vatRate: number;
  finalPrice: number;
  discount: number;
  stock: number;
  preOrder: string;
  images: string[];
  isActive: boolean;
  isDeleted: boolean;
  // Add more fields as needed
  oldPrice?: number; // optional
  dynamicFields?: DynamicField[]; // optional
  category?: string;
  packages?: Array<{
    title?: string;
    price?: number | string;
    stock?: number | string;
    images?: string[];
  }>;
}
export interface DynamicField {
  type: string;
  key: string;
  value: string[]; // or `string | string[]` if mixed types
}

export interface ProductData {
  type: "product";
  id: string;
  attributes: ProductAttributes;
  reviews: Array<{
    rating: number;
    comment: string;
    reviewerName: string;
  }>
}

export interface ShopPageProps {
  walletProducts: ProductData[];
  accessoryProducts: ProductData[];
}

export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}
