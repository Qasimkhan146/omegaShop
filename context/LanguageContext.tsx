"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import { fetchProductsByCategory } from "@/app/actions/GetAllProducts";
import type { ApiResponse, ProductData } from "@/types/product";

// Language types
type Language = "DE" | "EN";

type ProductsMap = Record<string, ApiResponse<ProductData[]> | null>;

// Language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  cartItems: any[];
  setCartItems: Dispatch<SetStateAction<any[]>>;
  productsByCategory: ProductsMap;
  productsLoading: boolean;
  productsError: string | null;
  loadProductsByCategory: (
    category: string,
    langOverride?: string
  ) => Promise<ApiResponse<ProductData[]> | null>;
  checkoutUrl: string | null;
  setCheckoutUrl: Dispatch<SetStateAction<string | null>>;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Language provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("EN");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // NEW: global products state
  const [productsByCategory, setProductsByCategory] = useState<ProductsMap>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Ensure homepage bootstrap fetch runs only once
  const didBootstrapRef = useRef(false);

  // Load language and cart items from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = (localStorage.getItem("language") as Language) || "EN";
      setLanguage(savedLang);
      const storedCart = localStorage.getItem("cartItems");
      if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch {}
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch {}
  }, [language]);

  // Save cart items to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // NEW: global fetcher
  const loadProductsByCategory = async (
    category: string,
    langOverride?: string
  ): Promise<ApiResponse<ProductData[]> | null> => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // fetchProductsByCategory expects lowercase language
      const langParam = (langOverride || language).toLowerCase();

      const res = await fetchProductsByCategory(langParam, category);

      setProductsByCategory((prev) => ({
        ...prev,
        [category]: res,
      }));

      if (!res?.success) {
        setProductsError(res?.message || "Failed to fetch products");
      }

      return res ?? null;
    } catch (err) {
      setProductsError("Failed to fetch products");
      return null;
    } finally {
      setProductsLoading(false);
    }
  };

  // NEW: on homepage load, fetch the default category once and store globally
  useEffect(() => {
    if (didBootstrapRef.current) return;
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      didBootstrapRef.current = true;
      loadProductsByCategory("wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        cartItems,
        setCartItems,
        productsByCategory,
        productsLoading,
        productsError,
        loadProductsByCategory,
        checkoutUrl,
        setCheckoutUrl,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
