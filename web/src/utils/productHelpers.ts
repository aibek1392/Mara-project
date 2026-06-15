import type { Product } from "../types";

export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

export function getProductStock(product: Product): number | null {
  if (product.stock === undefined || product.stock === null) return null;
  return product.stock;
}

export function isInStock(product: Product, requestedQty = 1): boolean {
  const stock = getProductStock(product);
  if (stock === null) return true;
  return stock >= requestedQty;
}

export function getDiscountPercent(product: Product): number {
  if (product.discountPercent && product.discountPercent > 0) {
    return product.discountPercent;
  }
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
  return 0;
}

export function calcSalePrice(basePrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return basePrice;
  return Math.round(basePrice * (1 - discountPercent / 100));
}
