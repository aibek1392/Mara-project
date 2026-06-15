import type { Product } from "../types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const productsJson = require("../../../shared/products.json") as Product[];

export const products = productsJson;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getByCategory(category?: string) {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}
