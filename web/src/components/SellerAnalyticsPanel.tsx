import { useMemo, useState, type ReactNode } from "react";
import type { Product, User } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { formatPrice } from "../utils/format";
import {
  aggregatePlatformAnalytics,
  buildAllSellerAnalytics,
  buildSellerAnalytics,
  loadOrdersFromStorage,
  type SellerAnalytics,
  type TrafficChannelId,
} from "../utils/sellerAnalytics";

interface SellerAnalyticsPanelProps {
  sellers: User[];
  products: Product[];
  /** Show only this seller — hides the selector (Seller Central). */
  fixedSellerId?: string;
  titleKey?: string;
  subtitleKey?: string;
  /** Nested inside Performance section — no outer card or duplicate header. */
  embedded?: boolean;
  /** Accordion subsections when embedded in Performance. */
  collapsible?: boolean;
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat-card analytics-metric">
      <h3>{label}</h3>
      <div className="stat-value">{value}</div>
      {hint && <p className="analytics-hint">{hint}</p>}
    </div>
  );
}

function RateBar({ value, tone }: { value: number; tone?: "good" | "warn" | "neutral" }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div className={`analytics-bar analytics-bar-${tone ?? "neutral"}`}>
      <div className="analytics-bar-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export function SellerAnalyticsPanel({
  sellers,
  products,
  fixedSellerId,
  titleKey = "owner.analytics.title",
  subtitleKey = "owner.analytics.subtitle",
  embedded = false,
  collapsible = false,
}: SellerAnalyticsPanelProps) {
  const { t, locale } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>("all");
  const isOwnStore = Boolean(fixedSellerId);
  const metricNs = "owner.analytics";

  const analyticsRows = useMemo(() => {
    const orders = loadOrdersFromStorage();
    if (fixedSellerId) {
      const seller = sellers.find((s) => s.id === fixedSellerId);
      if (!seller) return [];
      return [buildSellerAnalytics(seller, products, orders)];
    }
    return buildAllSellerAnalytics(sellers, products, orders);
  }, [sellers, products, fixedSellerId]);

  const platform = useMemo(() => aggregatePlatformAnalytics(analyticsRows), [analyticsRows]);

  const selected: SellerAnalytics | null = isOwnStore
    ? analyticsRows[0] ?? null
    : selectedId === "all"
      ? null
      : analyticsRows.find((row) => row.sellerId === selectedId) ?? null;

  const view = selected ?? {
    sellerId: "all",
    sellerName: t("owner.analytics.allSellers"),
    storeName: t("owner.analytics.platformView"),
    netRevenue: platform?.netRevenue ?? 0,
    grossRevenue: platform?.netRevenue ?? 0,
    returnsValue: 0,
    conversionRate: platform?.conversionRate ?? 0,
    averageOrderValue: platform?.averageOrderValue ?? 0,
    visitors: analyticsRows.reduce((sum, row) => sum + row.visitors, 0),
    ordersCount: analyticsRows.reduce((sum, row) => sum + row.ordersCount, 0),
    cac: platform?.cac ?? 0,
    clv: platform?.clv ?? 0,
    cartAbandonmentRate: platform?.cartAbandonmentRate ?? 0,
    cartsStarted: analyticsRows.reduce((sum, row) => sum + row.cartsStarted, 0),
    cartsCompleted: analyticsRows.reduce((sum, row) => sum + row.cartsCompleted, 0),
    uniqueCustomers: analyticsRows.reduce((sum, row) => sum + row.uniqueCustomers, 0),
    channels: platform?.channels ?? [],
    products: analyticsRows.flatMap((row) => row.products).sort((a, b) => b.revenue - a.revenue),
  };

  const channelLabel = (id: TrafficChannelId) => t(`${metricNs}.channels.${id}`);

  const overallReturnRate =
    view.products.length > 0
      ? Math.round(
          (view.products.reduce((sum, p) => sum + p.returnRate, 0) / view.products.length) * 10
        ) / 10
      : 0;

  const avgSellThrough =
    view.products.length > 0
      ? Math.round(
          (view.products.reduce((sum, p) => sum + p.sellThroughRate, 0) / view.products.length) * 10
        ) / 10
      : 0;

  const emptyMessage = isOwnStore
    ? t("seller.analytics.noData")
    : t("owner.analytics.noSellers");

  const wrapSection = (key: string, title: string, content: ReactNode) => {
    if (collapsible) {
      return (
        <CollapsiblePanel key={key} title={title} defaultOpen={false} variant="nested" className="analytics-collapsible">
          {content}
        </CollapsiblePanel>
      );
    }
    return (
      <section key={key} className="analytics-section">
        <h3>{title}</h3>
        {content}
      </section>
    );
  };

  const analyticsContent = (
    <>
      {!embedded && (
        <div className="analytics-panel-header">
          <div>
            <h2>{t(titleKey)}</h2>
            <p className="seller-profile-sub">{t(subtitleKey)}</p>
          </div>
          {!isOwnStore && (
            <div className="form-group" style={{ minWidth: 260, marginBottom: 0 }}>
              <label htmlFor="seller-analytics-select">{t("owner.analytics.selectSeller")}</label>
              <select
                id="seller-analytics-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="all">{t("owner.analytics.allSellers")}</option>
                {analyticsRows.map((row) => (
                  <option key={row.sellerId} value={row.sellerId}>
                    {row.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {!selected && !isOwnStore && sellers.length === 0 ? (
        <p style={{ color: "var(--grey-400)" }}>{emptyMessage}</p>
      ) : !view && isOwnStore ? (
        <p style={{ color: "var(--grey-400)" }}>{emptyMessage}</p>
      ) : (
        <>
          <p className="analytics-view-label">
            {isOwnStore
              ? t("seller.analytics.viewingStore", { name: view.storeName })
              : selected
                ? t("owner.analytics.viewingSeller", { name: selected.storeName })
                : t("owner.analytics.viewingAll")}
          </p>

          {wrapSection(
            "sales",
            t(`${metricNs}.salesPerformance`),
            <div className="dashboard-grid analytics-grid">
              <MetricCard
                label={t(`${metricNs}.netRevenue`)}
                value={formatPrice(view.netRevenue, locale)}
                hint={t(`${metricNs}.netRevenueHint`)}
              />
              <MetricCard
                label={t(`${metricNs}.conversionRate`)}
                value={`${view.conversionRate}%`}
                hint={t(`${metricNs}.conversionRateHint`, {
                  visitors: view.visitors.toLocaleString(),
                  orders: view.ordersCount,
                })}
              />
              <MetricCard
                label={t(`${metricNs}.aov`)}
                value={formatPrice(view.averageOrderValue, locale)}
                hint={t(`${metricNs}.aovHint`)}
              />
            </div>
          )}

          {wrapSection(
            "customer",
            t(`${metricNs}.customerBehavior`),
            <div className="dashboard-grid analytics-grid">
              <MetricCard
                label={t(`${metricNs}.cac`)}
                value={formatPrice(view.cac, locale)}
                hint={t(`${metricNs}.cacHint`)}
              />
              <MetricCard
                label={t(`${metricNs}.clv`)}
                value={formatPrice(view.clv, locale)}
                hint={t(`${metricNs}.clvHint`)}
              />
              <MetricCard
                label={t(`${metricNs}.cartAbandonment`)}
                value={`${view.cartAbandonmentRate}%`}
                hint={t(`${metricNs}.cartAbandonmentHint`, {
                  started: view.cartsStarted,
                  completed: view.cartsCompleted,
                })}
              />
            </div>
          )}

          {wrapSection(
            "marketing",
            t(`${metricNs}.marketingRoi`),
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t(`${metricNs}.channel`)}</th>
                    <th>{t(`${metricNs}.visits`)}</th>
                    <th>{t(`${metricNs}.adSpend`)}</th>
                    <th>{t(`${metricNs}.channelRevenue`)}</th>
                    <th>{t(`${metricNs}.conversions`)}</th>
                    <th>{t(`${metricNs}.roas`)}</th>
                  </tr>
                </thead>
                <tbody>
                  {view.channels
                    .slice()
                    .sort((a, b) => b.roas - a.roas)
                    .map((channel) => (
                      <tr key={channel.id}>
                        <td>{channelLabel(channel.id)}</td>
                        <td>{channel.visits.toLocaleString()}</td>
                        <td>{formatPrice(channel.adSpend, locale)}</td>
                        <td>{formatPrice(channel.revenue, locale)}</td>
                        <td>{channel.conversions}</td>
                        <td>
                          <span
                            className={`badge ${channel.roas >= 3 ? "badge-success" : channel.roas >= 1.5 ? "badge-role" : "badge-warn"}`}
                          >
                            {channel.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <p className="analytics-hint">{t(`${metricNs}.marketingHint`)}</p>
            </>
          )}

          {wrapSection(
            "inventory",
            t(`${metricNs}.inventoryProducts`),
            <>
              <div className="dashboard-grid analytics-grid analytics-grid-compact">
                <MetricCard
                  label={t(`${metricNs}.avgSellThrough`)}
                  value={`${avgSellThrough}%`}
                  hint={t(`${metricNs}.sellThroughHint`)}
                />
                <MetricCard
                  label={t(`${metricNs}.avgReturnRate`)}
                  value={`${overallReturnRate}%`}
                  hint={t(`${metricNs}.returnRateHint`)}
                />
              </div>

              {view.products.length === 0 ? (
                <p style={{ color: "var(--grey-400)" }}>{t(`${metricNs}.noProducts`)}</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("seller.productName")}</th>
                      <th>{t(`${metricNs}.unitsSold`)}</th>
                      <th>{t(`${metricNs}.stock`)}</th>
                      <th>{t(`${metricNs}.sellThrough`)}</th>
                      <th>{t(`${metricNs}.returnRate`)}</th>
                      <th>{t("common.price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.products.map((product) => (
                      <tr key={product.productId}>
                        <td>{product.productName}</td>
                        <td>{product.unitsSold}</td>
                        <td>{product.stock}</td>
                        <td>
                          <div className="analytics-inline-metric">
                            <span>{product.sellThroughRate}%</span>
                            <RateBar
                              value={product.sellThroughRate}
                              tone={
                                product.sellThroughRate >= 60
                                  ? "good"
                                  : product.sellThroughRate >= 30
                                    ? "neutral"
                                    : "warn"
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className="analytics-inline-metric">
                            <span>{product.returnRate}%</span>
                            <RateBar
                              value={Math.min(100, product.returnRate * 4)}
                              tone={
                                product.returnRate <= 5
                                  ? "good"
                                  : product.returnRate <= 12
                                    ? "neutral"
                                    : "warn"
                              }
                            />
                          </div>
                        </td>
                        <td>{formatPrice(product.revenue, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="analytics-hint">{t(`${metricNs}.inventoryHint`)}</p>
            </>
          )}
        </>
      )}
    </>
  );

  if (embedded) {
    return <div className="seller-analytics-embedded">{analyticsContent}</div>;
  }

  return <div className="card-panel seller-analytics-panel">{analyticsContent}</div>;
}
