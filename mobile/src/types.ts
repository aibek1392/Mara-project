export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  colors: string[];
  sizes: string[];
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}
