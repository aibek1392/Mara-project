import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const REVIEW_COUNT = 19;

interface ProductDetailSectionsProps {
  description?: string;
  sellerName?: string;
}

export function ProductDetailSections({ description, sellerName }: ProductDetailSectionsProps) {
  const { t } = useLanguage();
  const hasDescription = Boolean(description?.trim());
  const [openId, setOpenId] = useState<string | null>(hasDescription ? "descriptions" : null);

  const sections = [
    {
      id: "descriptions",
      title: t("product.descriptions"),
      content: hasDescription ? (
        <>
          {sellerName && (
            <p className="product-description-by">
              {t("product.descriptionBy", { seller: sellerName })}
            </p>
          )}
          <div className="product-description-body">{description!.trim()}</div>
        </>
      ) : (
        <p className="product-description-empty">{t("product.noDescription")}</p>
      ),
    },
    {
      id: "shipping",
      title: t("product.shipping"),
      content: (
        <>
          <p>{t("product.shippingStandard")}</p>
          <p>{t("product.shippingExpress")}</p>
          <p>{t("product.pickup")}</p>
        </>
      ),
    },
    {
      id: "size-fit",
      title: t("product.sizeFit"),
      content: (
        <>
          <p>{t("product.fitNote")}</p>
          <p>{t("product.modelNote")}</p>
          <p>
            <a href="/help#size-guide" className="product-detail-link">
              {t("product.sizeGuide")}
            </a>
          </p>
        </>
      ),
    },
    {
      id: "shipping-returns",
      title: t("product.shippingReturns"),
      content: (
        <>
          <p>{t("product.returnsNote")}</p>
          <p>
            {t("product.returnPolicy")}{" "}
            <a href="/help#returns" className="product-detail-link">
              {t("product.learnMore")}
            </a>
          </p>
          <p>{t("product.exchange")}</p>
        </>
      ),
    },
    {
      id: "reviews",
      title: `${t("product.reviews")} (${REVIEW_COUNT})`,
      content: (
        <div className="product-reviews">
          <div className="product-reviews-summary">
            <span className="product-reviews-score">4.8</span>
            <div>
              <div className="product-reviews-stars" aria-label={`4.8 ${t("product.outOf5")}`}>
                ★★★★★
              </div>
              <span className="product-reviews-count">
                {REVIEW_COUNT} {t("product.reviewsCount")}
              </span>
            </div>
          </div>
          <ul className="product-reviews-list">
            <li>
              <strong>{t("product.review1Title")}</strong>
              <p>{t("product.review1Text")}</p>
              <span className="product-reviews-meta">— Alex M. · {t("product.verified")}</span>
            </li>
            <li>
              <strong>{t("product.review2Title")}</strong>
              <p>{t("product.review2Text")}</p>
              <span className="product-reviews-meta">— Jordan K. · {t("product.verified")}</span>
            </li>
            <li>
              <strong>{t("product.review3Title")}</strong>
              <p>{t("product.review3Text")}</p>
              <span className="product-reviews-meta">— Sam T. · {t("product.verified")}</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="product-detail-sections">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="product-accordion">
            <button
              type="button"
              className="product-accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => toggle(section.id)}
            >
              <span>{section.title}</span>
              <span className={`product-accordion-chevron ${isOpen ? "open" : ""}`} aria-hidden>
                ›
              </span>
            </button>
            {isOpen && (
              <div className="product-accordion-panel">{section.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
