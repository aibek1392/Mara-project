import type { Order, Product, User } from "../types";

export type TrafficChannelId = "google" | "social" | "email" | "direct";

export interface TrafficChannelMetrics {
  id: TrafficChannelId;
  visits: number;
  adSpend: number;
  revenue: number;
  conversions: number;
  roas: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  stock: number;
  sellThroughRate: number;
  returnRate: number;
  revenue: number;
}

export interface SellerAnalytics {
  sellerId: string;
  sellerName: string;
  storeName: string;
  netRevenue: number;
  grossRevenue: number;
  returnsValue: number;
  conversionRate: number;
  averageOrderValue: number;
  visitors: number;
  ordersCount: number;
  cac: number;
  clv: number;
  cartAbandonmentRate: number;
  cartsStarted: number;
  cartsCompleted: number;
  uniqueCustomers: number;
  channels: TrafficChannelMetrics[];
  products: ProductPerformance[];
}

const ORDERS_KEY = "door2door_orders";

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function loadOrdersFromStorage(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? (JSON.parse(stored) as Order[]) : [];
  } catch {
    return [];
  }
}

function isReturned(status?: string): boolean {
  return status === "requested" || status === "approved" || status === "completed";
}

function buildProductPerformance(
  sellerProducts: Product[],
  sellerOrders: Order[],
  seed: number
): ProductPerformance[] {
  const stats = new Map<
    string,
    { unitsSold: number; returned: number; revenue: number; name: string; stock: number }
  >();

  for (const product of sellerProducts) {
    stats.set(product.id, {
      unitsSold: 0,
      returned: 0,
      revenue: 0,
      name: product.name,
      stock: product.stock ?? 20 + (seed % 80),
    });
  }

  for (const order of sellerOrders) {
    for (const item of order.items) {
      const entry = stats.get(item.productId);
      if (!entry) continue;
      entry.unitsSold += item.quantity;
      entry.revenue += item.price * item.quantity;
      if (isReturned(item.returnStatus)) {
        entry.returned += item.quantity;
      }
    }
  }

  const rows: ProductPerformance[] = [];

  for (const [productId, data] of stats) {
    const totalInventory = data.unitsSold + data.stock;
    const sellThroughRate =
      totalInventory > 0 ? Math.round((data.unitsSold / totalInventory) * 1000) / 10 : 0;
    const returnRate =
      data.unitsSold > 0 ? Math.round((data.returned / data.unitsSold) * 1000) / 10 : 0;

    rows.push({
      productId,
      productName: data.name,
      unitsSold: data.unitsSold,
      stock: data.stock,
      sellThroughRate,
      returnRate,
      revenue: data.revenue,
    });
  }

  return rows.sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);
}

function buildChannels(
  netRevenue: number,
  ordersCount: number,
  seed: number
): TrafficChannelMetrics[] {
  const channelDefs: { id: TrafficChannelId; visitShare: number; spendShare: number }[] = [
    { id: "google", visitShare: 0.38, spendShare: 0.42 },
    { id: "social", visitShare: 0.28, spendShare: 0.26 },
    { id: "email", visitShare: 0.18, spendShare: 0.14 },
    { id: "direct", visitShare: 0.16, spendShare: 0.18 },
  ];

  const totalAdSpend = 12000 + (seed % 68000);
  const totalVisits = 600 + (seed % 5400);
  const revenueBase = netRevenue > 0 ? netRevenue : 45000 + (seed % 120000);

  return channelDefs.map((def, idx) => {
    const visits = Math.round(totalVisits * def.visitShare);
    const adSpend = Math.round(totalAdSpend * def.spendShare);
    const revenue = Math.round(revenueBase * (0.22 + (idx % 3) * 0.08 + def.spendShare * 0.3));
    const conversions = Math.max(
      1,
      Math.round(ordersCount * def.visitShare) || Math.round(visits * (0.02 + (seed % 5) / 100))
    );
    const roas = adSpend > 0 ? Math.round((revenue / adSpend) * 100) / 100 : 0;
    return { id: def.id, visits, adSpend, revenue, conversions, roas };
  });
}

export function buildSellerAnalytics(
  seller: User,
  allProducts: Product[],
  allOrders: Order[]
): SellerAnalytics {
  const seed = hashSeed(seller.id);
  const sellerProducts = allProducts.filter((p) => p.sellerId === seller.id);
  const sellerOrders = allOrders.filter((o) =>
    o.items.some((i) => i.sellerId === seller.id)
  );

  let grossRevenue = 0;
  let returnsValue = 0;
  const customerIds = new Set<string>();

  for (const order of sellerOrders) {
    let orderHasSeller = false;
    for (const item of order.items) {
      if (item.sellerId !== seller.id) continue;
      orderHasSeller = true;
      const lineTotal = item.price * item.quantity;
      grossRevenue += lineTotal;
      if (isReturned(item.returnStatus)) {
        returnsValue += lineTotal;
      }
    }
    if (orderHasSeller) customerIds.add(order.userId);
  }

  const netRevenue = grossRevenue - returnsValue;
  const ordersCount = sellerOrders.length;
  const uniqueCustomers = customerIds.size;

  const baselineVisitors = 750 + (seed % 4250);
  const visitors = Math.max(baselineVisitors, ordersCount * (18 + (seed % 12)));
  const conversionRate =
    visitors > 0 ? Math.round((ordersCount / visitors) * 10000) / 100 : 0;

  const averageOrderValue =
    ordersCount > 0 ? Math.round(netRevenue / ordersCount) : 2800 + (seed % 4200);

  const cartAbandonmentRate = 52 + (seed % 28);
  const cartsCompleted = Math.max(ordersCount, 3 + (seed % 40));
  const cartsStarted = Math.round(cartsCompleted / (1 - cartAbandonmentRate / 100));

  const totalAdSpend = 10000 + (seed % 72000);
  const cac =
    uniqueCustomers > 0
      ? Math.round(totalAdSpend / uniqueCustomers)
      : Math.round(totalAdSpend / (3 + (seed % 8)));

  const avgPerCustomer =
    uniqueCustomers > 0 ? netRevenue / uniqueCustomers : netRevenue || 8500 + (seed % 15000);
  const repeatMultiplier = 1.6 + (seed % 15) / 10;
  const clv = Math.round(avgPerCustomer * repeatMultiplier);

  const channels = buildChannels(netRevenue, ordersCount, seed);
  const products = buildProductPerformance(sellerProducts, sellerOrders, seed);

  return {
    sellerId: seller.id,
    sellerName: seller.name,
    storeName: seller.storeName ?? seller.name,
    netRevenue: netRevenue || 38000 + (seed % 95000),
    grossRevenue: grossRevenue || 42000 + (seed % 100000),
    returnsValue,
    conversionRate: conversionRate || 1.8 + (seed % 45) / 10,
    averageOrderValue,
    visitors,
    ordersCount: ordersCount || 8 + (seed % 55),
    cac,
    clv,
    cartAbandonmentRate,
    cartsStarted,
    cartsCompleted,
    uniqueCustomers: uniqueCustomers || 4 + (seed % 22),
    channels,
    products,
  };
}

export function buildAllSellerAnalytics(
  sellers: User[],
  products: Product[],
  orders?: Order[]
): SellerAnalytics[] {
  const orderData = orders ?? loadOrdersFromStorage();
  return sellers.map((seller) => buildSellerAnalytics(seller, products, orderData));
}

export function aggregatePlatformAnalytics(rows: SellerAnalytics[]) {
  if (rows.length === 0) {
    return null;
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.netRevenue += row.netRevenue;
      acc.visitors += row.visitors;
      acc.ordersCount += row.ordersCount;
      acc.cac += row.cac;
      acc.clv += row.clv;
      acc.cartAbandonmentRate += row.cartAbandonmentRate;
      acc.conversionRate += row.conversionRate;
      acc.aov += row.averageOrderValue;
      return acc;
    },
    {
      netRevenue: 0,
      visitors: 0,
      ordersCount: 0,
      cac: 0,
      clv: 0,
      cartAbandonmentRate: 0,
      conversionRate: 0,
      aov: 0,
    }
  );

  const n = rows.length;
  const channelMap = new Map<TrafficChannelId, TrafficChannelMetrics>();

  for (const row of rows) {
    for (const ch of row.channels) {
      const existing = channelMap.get(ch.id);
      if (!existing) {
        channelMap.set(ch.id, { ...ch });
      } else {
        existing.visits += ch.visits;
        existing.adSpend += ch.adSpend;
        existing.revenue += ch.revenue;
        existing.conversions += ch.conversions;
        existing.roas =
          existing.adSpend > 0
            ? Math.round((existing.revenue / existing.adSpend) * 100) / 100
            : 0;
      }
    }
  }

  return {
    netRevenue: totals.netRevenue,
    conversionRate:
      totals.visitors > 0
        ? Math.round((totals.ordersCount / totals.visitors) * 10000) / 100
        : Math.round((totals.conversionRate / n) * 100) / 100,
    averageOrderValue: Math.round(totals.netRevenue / Math.max(totals.ordersCount, 1)),
    cac: Math.round(totals.cac / n),
    clv: Math.round(totals.clv / n),
    cartAbandonmentRate: Math.round(totals.cartAbandonmentRate / n),
    channels: Array.from(channelMap.values()).sort((a, b) => b.roas - a.roas),
  };
}
