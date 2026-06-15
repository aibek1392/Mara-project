import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { ALL_CATEGORIES } from "../types";

const categoryImages: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
  computers: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  clothing: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
  "home-kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "sports-outdoors": "https://images.unsplash.com/photo-1461896836934-ffe776475345?w=400&q=80",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  "toys-games": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
  automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
  garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
  "pet-supplies": "https://images.unsplash.com/photo-1450778869180-41d060ebf435?w=400&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
  baby: "https://images.unsplash.com/photo-1515488042361-ee00e745b6e7?w=400&q=80",
  "movies-music": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
  tools: "https://images.unsplash.com/photo-1504141413702-14f0326a2f91?w=400&q=80",
};

export function HomePage() {
  const { products } = useProducts();
  const { t, category } = useLanguage();
  const featured = products.filter((p) => p.originalPrice).slice(0, 6);
  const trending = products.slice(0, 8);
  const primeProducts = products.filter((p) => p.prime).slice(0, 6);
  const topCategories = ALL_CATEGORIES.slice(0, 8);

  return (
    <>
      <section className="hero-carousel">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80"
          alt={t("home.bannerAlt")}
        />
        <div className="hero-carousel-content">
          <h1>{t("home.welcome")}</h1>
          <p>{t("home.subtitle")}</p>
          <Link to="/shop" className="btn btn-primary">
            {t("home.shopAllDeals")}
          </Link>
        </div>
      </section>

      <div className="deals-banner">
        <div className="deal-card">
          <h3>{t("home.deal1Title")}</h3>
          <p>{t("home.deal1Desc")}</p>
          <Link to="/shop/electronics" className="btn">
            {t("common.shopNow")}
          </Link>
        </div>
        <div className="deal-card">
          <h3>{t("home.deal2Title")}</h3>
          <p>{t("home.deal2Desc")}</p>
          <Link to="/shop" className="btn">
            {t("home.deal2Btn")}
          </Link>
        </div>
        <div className="deal-card">
          <h3>{t("home.deal3Title")}</h3>
          <p>{t("home.deal3Desc")}</p>
          <Link to="/shop/clothing" className="btn">
            {t("common.explore")}
          </Link>
        </div>
      </div>

      <section className="home-section">
        <div className="home-section-header">
          <h2>{t("home.shopByCategory")}</h2>
          <Link to="/shop">{t("common.seeAll")}</Link>
        </div>
        <div className="category-cards">
          {topCategories.map((cat) => (
            <Link key={cat} to={`/shop/${cat}`} className="category-card">
              <img
                src={categoryImages[cat] ?? categoryImages.electronics}
                alt={category(cat)}
              />
              <div className="category-card-info">
                <h3>{category(cat)}</h3>
                <span>{t("home.shopNowArrow")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2>{t("home.todaysDeals")}</h2>
          <Link to="/shop">{t("home.viewAllDeals")}</Link>
        </div>
        <div className="product-row">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2>{t("home.primePicks")}</h2>
          <Link to="/shop">{t("home.seeMore")}</Link>
        </div>
        <div className="product-row">
          {primeProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2>{t("home.bestSellers")}</h2>
          <Link to="/shop">{t("common.explore")}</Link>
        </div>
        <div className="product-row">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2>{t("home.allCategories")}</h2>
        </div>
        <div className="filter-bar">
          {ALL_CATEGORIES.map((cat) => (
            <Link key={cat} to={`/shop/${cat}`} className="filter-btn">
              {category(cat)}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
