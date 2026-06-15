import { useMemo, useState } from "react";
import type { Product, ProductCategory, User } from "../types";
import { ALL_CATEGORIES } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/format";
import {
  buildAllDepartmentRankings,
  buildDepartmentRanking,
  DEPARTMENT_TOP_LIMIT,
  type DepartmentSortKey,
} from "../utils/departmentRankings";
import { loadOrdersFromStorage } from "../utils/sellerAnalytics";

interface DepartmentSellerRankingsProps {
  sellers: User[];
  products: Product[];
}

const SORT_OPTIONS: DepartmentSortKey[] = [
  "netRevenue",
  "unitsSold",
  "ordersCount",
  "conversionRate",
];

export function DepartmentSellerRankings({ sellers, products }: DepartmentSellerRankingsProps) {
  const { t, category, locale } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("electronics");
  const [sortKey, setSortKey] = useState<DepartmentSortKey>("netRevenue");

  const ranking = useMemo(() => {
    const orders = loadOrdersFromStorage();
    return buildDepartmentRanking(selectedCategory, sellers, products, orders, sortKey);
  }, [selectedCategory, sellers, products, sortKey]);

  const departmentsWithSellers = useMemo(() => {
    const all = buildAllDepartmentRankings(sellers, products, loadOrdersFromStorage(), sortKey);
    return all.filter((dept) => dept.totalInDepartment > 0).length;
  }, [sellers, products, sortKey]);

  const sortLabel = (key: DepartmentSortKey) => t(`owner.rankings.sort.${key}`);

  return (
    <div className="card-panel department-rankings-panel">
      <div className="analytics-panel-header">
        <div>
          <h2>{t("owner.rankings.title")}</h2>
          <p className="seller-profile-sub">{t("owner.rankings.subtitle", { limit: DEPARTMENT_TOP_LIMIT })}</p>
        </div>
        <div className="department-rankings-controls">
          <div className="form-group" style={{ marginBottom: 0, minWidth: 220 }}>
            <label htmlFor="dept-select">{t("owner.rankings.department")}</label>
            <select
              id="dept-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {category(cat)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
            <label htmlFor="dept-sort">{t("owner.rankings.sortBy")}</label>
            <select
              id="dept-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as DepartmentSortKey)}
            >
              {SORT_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {sortLabel(key)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="analytics-view-label">
        {t("owner.rankings.summary", {
          department: category(selectedCategory),
          showing: ranking.sellers.length,
          total: ranking.totalInDepartment,
          limit: DEPARTMENT_TOP_LIMIT,
          activeDepartments: departmentsWithSellers,
        })}
      </p>

      {ranking.sellers.length === 0 ? (
        <p style={{ color: "var(--grey-400)" }}>{t("owner.rankings.noSellers")}</p>
      ) : (
        <div className="department-rankings-table-wrap">
          <table className="data-table department-rankings-table">
            <thead>
              <tr>
                <th>{t("owner.rankings.rank")}</th>
                <th>{t("common.store")}</th>
                <th>{t("common.seller")}</th>
                <th>{t("owner.rankings.market")}</th>
                <th>{t("owner.analytics.netRevenue")}</th>
                <th>{t("owner.analytics.unitsSold")}</th>
                <th>{t("owner.rankings.products")}</th>
                <th>{t("owner.rankings.orders")}</th>
                <th>{t("owner.analytics.conversionRate")}</th>
              </tr>
            </thead>
            <tbody>
              {ranking.sellers.map((row) => (
                <tr key={row.sellerId} className={row.rank <= 3 ? `rank-top rank-top-${row.rank}` : undefined}>
                  <td>
                    <span className={`rank-badge ${row.rank <= 3 ? "rank-badge-top" : ""}`}>#{row.rank}</span>
                  </td>
                  <td>{row.storeName}</td>
                  <td>{row.sellerName}</td>
                  <td>{row.marketName || t("common.dash")}</td>
                  <td>{formatPrice(row.netRevenue, locale)}</td>
                  <td>{row.unitsSold.toLocaleString()}</td>
                  <td>{row.productCount}</td>
                  <td>{row.ordersCount}</td>
                  <td>{row.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
