import { useMemo } from "react";
import type { Product, User } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { buildSellerBillingReport } from "../utils/billingReport";
import { formatPrice } from "../utils/format";
import { loadOrdersFromStorage } from "../utils/sellerAnalytics";
import { CollapsiblePanel } from "./CollapsiblePanel";

interface SellerBillingReportPanelProps {
  seller: User;
  products: Product[];
  defaultOpen?: boolean;
}

export function SellerBillingReportPanel({
  seller,
  products,
  defaultOpen = false,
}: SellerBillingReportPanelProps) {
  const { t, locale } = useLanguage();

  const report = useMemo(
    () => buildSellerBillingReport(seller.id, products, loadOrdersFromStorage()),
    [seller.id, products]
  );

  return (
    <CollapsiblePanel
      title={t("seller.billingReport.title")}
      subtitle={t("seller.billingReport.subtitle")}
      defaultOpen={defaultOpen}
      variant="nested"
      className="seller-billing-collapsible"
    >
      <div className="billing-report-summary">
        <div className="stat-card analytics-metric">
          <h3>{t("seller.billingReport.totalRevenue")}</h3>
          <div className="stat-value">{formatPrice(report.totalRevenue, locale)}</div>
        </div>
        <div className="stat-card analytics-metric">
          <h3>{t("seller.billingReport.totalCost")}</h3>
          <div className="stat-value">{formatPrice(report.totalCost, locale)}</div>
        </div>
        <div className="stat-card analytics-metric">
          <h3>{t("seller.billingReport.totalNetMargin")}</h3>
          <div className="stat-value">{formatPrice(report.totalNetMargin, locale)}</div>
          <p className="analytics-hint">{t("seller.billingReport.marginFormula")}</p>
        </div>
      </div>

      {report.products.length === 0 ? (
        <p style={{ color: "var(--grey-400)" }}>{t("seller.billingReport.noProducts")}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("seller.productName")}</th>
              <th>{t("seller.billingReport.salePrice")}</th>
              <th>{t("seller.costPrice")}</th>
              <th>{t("seller.billingReport.marginPerUnit")}</th>
              <th>{t("seller.billingReport.unitsSold")}</th>
              <th>{t("seller.billingReport.netPerProduct")}</th>
            </tr>
          </thead>
          <tbody>
            {report.products.map((row) => (
              <tr key={row.productId}>
                <td>{row.productName}</td>
                <td>{formatPrice(row.salePrice, locale)}</td>
                <td>{row.costPrice > 0 ? formatPrice(row.costPrice, locale) : t("common.dash")}</td>
                <td>
                  {row.costPrice > 0 ? (
                    <span className={row.marginPerUnit >= 0 ? "margin-positive" : "margin-negative"}>
                      {formatPrice(row.marginPerUnit, locale)}
                    </span>
                  ) : (
                    t("common.dash")
                  )}
                </td>
                <td>{row.unitsSold}</td>
                <td>
                  <strong>{formatPrice(row.netMargin, locale)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </CollapsiblePanel>
  );
}
