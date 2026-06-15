import type { Order, Product } from "../types";
import { loadOrdersFromStorage } from "./sellerAnalytics";

export interface ProductMarginRow {
  productId: string;
  productName: string;
  salePrice: number;
  costPrice: number;
  marginPerUnit: number;
  unitsSold: number;
  netMargin: number;
}

export interface SellerBillingReport {
  sellerId: string;
  products: ProductMarginRow[];
  totalRevenue: number;
  totalCost: number;
  totalNetMargin: number;
}

function isReturned(status?: string): boolean {
  return status === "requested" || status === "approved" || status === "completed";
}

export function calcMarginPerUnit(salePrice: number, costPrice: number): number {
  return Math.round((salePrice - costPrice) * 100) / 100;
}

export function buildSellerBillingReport(
  sellerId: string,
  products: Product[],
  orders?: Order[]
): SellerBillingReport {
  const orderData = orders ?? loadOrdersFromStorage();
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  const productMap = new Map(sellerProducts.map((p) => [p.id, p]));

  const stats = new Map<
    string,
    {
      productName: string;
      salePrice: number;
      costPrice: number;
      unitsSold: number;
      returnedUnits: number;
    }
  >();

  for (const product of sellerProducts) {
    stats.set(product.id, {
      productName: product.name,
      salePrice: product.price,
      costPrice: product.costPrice ?? 0,
      unitsSold: 0,
      returnedUnits: 0,
    });
  }

  for (const order of orderData) {
    for (const item of order.items) {
      if (item.sellerId !== sellerId) continue;
      const product = productMap.get(item.productId);
      let entry = stats.get(item.productId);
      if (!entry) {
        entry = {
          productName: item.productName,
          salePrice: item.price,
          costPrice: item.costPrice ?? product?.costPrice ?? 0,
          unitsSold: 0,
          returnedUnits: 0,
        };
        stats.set(item.productId, entry);
      }
      entry.unitsSold += item.quantity;
      entry.salePrice = item.price;
      if (item.costPrice !== undefined) {
        entry.costPrice = item.costPrice;
      } else if (product?.costPrice !== undefined) {
        entry.costPrice = product.costPrice;
      }
      if (isReturned(item.returnStatus)) {
        entry.returnedUnits += item.quantity;
      }
    }
  }

  const rows: ProductMarginRow[] = [];
  let totalRevenue = 0;
  let totalCost = 0;
  let totalNetMargin = 0;

  for (const [productId, data] of stats) {
    const netUnits = Math.max(0, data.unitsSold - data.returnedUnits);
    const marginPerUnit = calcMarginPerUnit(data.salePrice, data.costPrice);
    const netMargin = Math.round(marginPerUnit * netUnits);
    const revenue = data.salePrice * netUnits;
    const cost = data.costPrice * netUnits;

    rows.push({
      productId,
      productName: data.productName,
      salePrice: data.salePrice,
      costPrice: data.costPrice,
      marginPerUnit,
      unitsSold: netUnits,
      netMargin,
    });

    totalRevenue += revenue;
    totalCost += cost;
    totalNetMargin += netMargin;
  }

  return {
    sellerId,
    products: rows.sort((a, b) => b.netMargin - a.netMargin || b.unitsSold - a.unitsSold),
    totalRevenue,
    totalCost,
    totalNetMargin,
  };
}
