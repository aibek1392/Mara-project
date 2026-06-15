import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "./LanguageContext";
import type { Product, ProductCategory } from "../types";
import { baseProducts } from "../data/products";
import { localizeProducts } from "../utils/localizeProduct";

const SELLER_PRODUCTS_KEY = "door2door_seller_products";

function loadSellerProducts(): Product[] {
  const stored = localStorage.getItem(SELLER_PRODUCTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Product[];
  } catch {
    return [];
  }
}

function saveSellerProducts(products: Product[]) {
  localStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(products));
}

interface ProductContextValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  getByCategory: (category: ProductCategory | "all") => Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  getSellerProducts: (sellerId: string) => Product[];
  getRawSellerProduct: (id: string) => Product | undefined;
  decrementStock: (productId: string, quantity: number) => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  useEffect(() => {
    setSellerProducts(loadSellerProducts());
  }, []);

  const rawProducts = useMemo(
    () => [...baseProducts, ...sellerProducts],
    [sellerProducts]
  );

  const products = useMemo(
    () => localizeProducts(rawProducts, locale),
    [rawProducts, locale]
  );

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getByCategory = useCallback(
    (category: ProductCategory | "all") => {
      if (category === "all") return products;
      return products.filter((p) => p.category === category);
    },
    [products]
  );

  const addProduct = useCallback((product: Product) => {
    setSellerProducts((prev) => {
      const next = [...prev, product];
      saveSellerProducts(next);
      return next;
    });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setSellerProducts((prev) => {
      const next = prev.map((p) => (p.id === product.id ? product : p));
      saveSellerProducts(next);
      return next;
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setSellerProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveSellerProducts(next);
      return next;
    });
  }, []);

  const getRawSellerProduct = useCallback(
    (id: string) => sellerProducts.find((p) => p.id === id),
    [sellerProducts]
  );

  const decrementStock = useCallback((productId: string, quantity: number) => {
    setSellerProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== productId || p.stock === undefined) return p;
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      });
      saveSellerProducts(next);
      return next;
    });
  }, []);

  const getSellerProducts = useCallback(
    (sellerId: string) =>
      localizeProducts(
        rawProducts.filter((p) => p.sellerId === sellerId),
        locale
      ),
    [rawProducts, locale]
  );

  const value = useMemo(
    () => ({
      products,
      getProduct,
      getByCategory,
      addProduct,
      updateProduct,
      removeProduct,
      getSellerProducts,
      getRawSellerProduct,
      decrementStock,
    }),
    [
      products,
      getProduct,
      getByCategory,
      addProduct,
      updateProduct,
      removeProduct,
      getSellerProducts,
      getRawSellerProduct,
      decrementStock,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
