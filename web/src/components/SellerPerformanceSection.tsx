import type { Product, User } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { SellerAnalyticsPanel } from "./SellerAnalyticsPanel";
import { SellerBillingReportPanel } from "./SellerBillingReportPanel";

interface SellerPerformanceSectionProps {
  user: User;
  products: Product[];
}

export function SellerPerformanceSection({ user, products }: SellerPerformanceSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="seller-section seller-performance-section" id="performance">
      <CollapsiblePanel
        title={t("seller.performance.title")}
        subtitle={t("seller.performance.subtitle")}
        defaultOpen={false}
        variant="section"
        className="seller-performance-collapsible"
      >
        <CollapsiblePanel
          title={t("seller.analytics.title")}
          subtitle={t("seller.analytics.subtitle")}
          defaultOpen={false}
          variant="nested"
          className="seller-analytics-collapsible"
        >
          <SellerAnalyticsPanel
            sellers={[user]}
            products={products}
            fixedSellerId={user.id}
            embedded
            collapsible
          />

          <SellerBillingReportPanel seller={user} products={products} />
        </CollapsiblePanel>
      </CollapsiblePanel>
    </section>
  );
}
