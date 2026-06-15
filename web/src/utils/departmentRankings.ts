import type { Order, Product, ProductCategory, User } from "../types";
import { ALL_CATEGORIES } from "../types";
import { getMarketDisplayName, loadSellerProfile } from "./sellerProfile";
import { loadOrdersFromStorage } from "./sellerAnalytics";

export type DepartmentSortKey = "netRevenue" | "unitsSold" | "ordersCount" | "conversionRate";

export interface DepartmentSellerRank {
  rank: number;
  sellerId: string;
  sellerName: string;
  storeName: string;
  marketName: string;
  netRevenue: number;
  unitsSold: number;
  productCount: number;
  ordersCount: number;
  conversionRate: number;
}

export interface DepartmentRanking {
  category: ProductCategory;
  sellers: DepartmentSellerRank[];
  totalInDepartment: number;
}

const TOP_LIMIT = 200;

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function isReturned(status?: string): boolean {
  return status === "requested" || status === "approved" || status === "completed";
}

function baselineForCategory(sellerId: string, category: ProductCategory, productCount: number): {
  netRevenue: number;
  unitsSold: number;
  ordersCount: number;
  conversionRate: number;
} {
  const seed = hashSeed(`${sellerId}:${category}`);
  const netRevenue = 8000 + (seed % 92000) + productCount * 1200;
  const unitsSold = 12 + (seed % 180) + productCount * 8;
  const ordersCount = 3 + (seed % 42) + productCount * 2;
  const visitors = 400 + (seed % 3600);
  const conversionRate = Math.round((ordersCount / visitors) * 10000) / 100;
  return { netRevenue, unitsSold, ordersCount, conversionRate };
}

function computeCategoryMetrics(
  sellerId: string,
  category: ProductCategory,
  categoryProductIds: Set<string>,
  orders: Order[],
  productCount: number
) {
  let grossRevenue = 0;
  let returnsValue = 0;
  let unitsSold = 0;
  const orderIds = new Set<string>();

  for (const order of orders) {
    let orderTouched = false;
    for (const item of order.items) {
      if (item.sellerId !== sellerId || !categoryProductIds.has(item.productId)) continue;
      orderTouched = true;
      const lineTotal = item.price * item.quantity;
      grossRevenue += lineTotal;
      unitsSold += item.quantity;
      if (isReturned(item.returnStatus)) {
        returnsValue += lineTotal;
      }
    }
    if (orderTouched) orderIds.add(order.id);
  }

  const netRevenue = grossRevenue - returnsValue;
  const ordersCount = orderIds.size;

  if (netRevenue > 0 || unitsSold > 0) {
    const seed = hashSeed(`${sellerId}:${category}`);
    const visitors = Math.max(400 + (seed % 3600), ordersCount * 20);
    const conversionRate =
      visitors > 0 ? Math.round((ordersCount / visitors) * 10000) / 100 : 0;
    return { netRevenue, unitsSold, ordersCount, conversionRate };
  }

  return baselineForCategory(sellerId, category, productCount);
}

function sortRankings(rows: DepartmentSellerRank[], sortKey: DepartmentSortKey): DepartmentSellerRank[] {
  const sorted = [...rows].sort((a, b) => {
    const primary = b[sortKey] - a[sortKey];
    if (primary !== 0) return primary;
    return b.netRevenue - a.netRevenue || b.unitsSold - a.unitsSold;
  });
  return sorted.map((row, idx) => ({ ...row, rank: idx + 1 }));
}

export function buildDepartmentRanking(
  category: ProductCategory,
  sellers: User[],
  products: Product[],
  orders: Order[],
  sortKey: DepartmentSortKey = "netRevenue"
): DepartmentRanking {
  const categoryProducts = products.filter((p) => p.category === category && p.sellerId);
  const sellerProductIds = new Map<string, Set<string>>();
  const sellerProductCounts = new Map<string, number>();

  for (const product of categoryProducts) {
    const sellerId = product.sellerId!;
    if (!sellerProductIds.has(sellerId)) {
      sellerProductIds.set(sellerId, new Set());
      sellerProductCounts.set(sellerId, 0);
    }
    sellerProductIds.get(sellerId)!.add(product.id);
    sellerProductCounts.set(sellerId, (sellerProductCounts.get(sellerId) ?? 0) + 1);
  }

  const rows: DepartmentSellerRank[] = [];

  for (const seller of sellers) {
    const productIds = sellerProductIds.get(seller.id);
    if (!productIds || productIds.size === 0) continue;

    const productCount = sellerProductCounts.get(seller.id) ?? 0;
    const metrics = computeCategoryMetrics(
      seller.id,
      category,
      productIds,
      orders,
      productCount
    );
    const profile = loadSellerProfile(seller.id);

    rows.push({
      rank: 0,
      sellerId: seller.id,
      sellerName: seller.name,
      storeName: seller.storeName ?? seller.name,
      marketName: profile ? getMarketDisplayName(profile) : "",
      netRevenue: metrics.netRevenue,
      unitsSold: metrics.unitsSold,
      productCount,
      ordersCount: metrics.ordersCount,
      conversionRate: metrics.conversionRate,
    });
  }

  const sorted = sortRankings(rows, sortKey).slice(0, TOP_LIMIT);

  return {
    category,
    sellers: sorted,
    totalInDepartment: rows.length,
  };
}

export function buildAllDepartmentRankings(
  sellers: User[],
  products: Product[],
  orders?: Order[],
  sortKey: DepartmentSortKey = "netRevenue"
): DepartmentRanking[] {
  const orderData = orders ?? loadOrdersFromStorage();
  return ALL_CATEGORIES.map((category) =>
    buildDepartmentRanking(category, sellers, products, orderData, sortKey)
  );
}

export const DEPARTMENT_TOP_LIMIT = TOP_LIMIT;
