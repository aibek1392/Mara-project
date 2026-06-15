import type { Locale } from "../i18n/types";
import type { Product } from "../types";
import { productI18n } from "../i18n/productTranslations";

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === "ru") return product;
  const entry = productI18n[product.id]?.[locale];
  if (!entry) return product;
  return {
    ...product,
    name: entry.name,
    description: entry.description,
  };
}

export function localizeProducts(products: Product[], locale: Locale): Product[] {
  return products.map((p) => localizeProduct(p, locale));
}
