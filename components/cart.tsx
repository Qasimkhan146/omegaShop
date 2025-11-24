"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { FiTrash2 } from "react-icons/fi";
import { HiMinus, HiPlus } from "react-icons/hi";
// import { Checkout } from "@/app/actions/Checkout";
// import type { CartItem as CartItemType } from "@/types/cart";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

const CartMenu = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { language, cartItems, setCartItems, setCheckoutUrl } = useLanguage();
  const t = languageData[language]?.cart ?? {};
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // when we land on the shipping page, stop the spinner and close the cart
    if (pathname === "/shipping" || pathname.startsWith("/shipping")) {
      setIsCheckoutLoading(false);
      setIsCartOpen(false);
      try {
        sessionStorage.removeItem("checkoutLoading");
      } catch {}
    }
  }, [pathname]);

  useEffect(() => {
    const resetLoader = () => {
      setIsCheckoutLoading(false);
      try {
        // clear any “in-flight” flag you set before redirect
        sessionStorage.removeItem("checkoutLoading");
      } catch {}
    };

    // Run on mount (covers hard navigations too)
    resetLoader();

    // Fires when navigating back via bfcache
    window.addEventListener("pageshow", resetLoader);

    // Fires when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") resetLoader();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", resetLoader);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const cartIconUrl =
    "https://omega-wallet.s3.us-east-2.amazonaws.com/cart-icon.png";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  interface CartItemAttributes {
    title: string;
    images?: string[];
    price?: number | string;
    finalPrice?: number | string;
    vatAmount?: number | string;
    vatRate?: number | string;
    finalUnitGross?: number;
  }

  interface CartItem {
    id: string;
    attributes: CartItemAttributes;
    quantity: number;
    packKey?: string;
    packMultiplier?: number;
  }

  const sync = (updated: CartItem[]) => {
    setCartItems(updated);
    try {
      localStorage.setItem("cartItems", JSON.stringify(updated));
    } catch {}
  };

  // const increaseQty = (index: number) => {
  //   const updated = [...cartItems];
  //   updated[index].quantity += 1;
  //   sync(updated);
  // };
  const increaseQty = (index: number) => {
    const updated = [...cartItems];
    const item = updated[index];

    const currentQty = item.quantity ?? 0;
    const stock = Number((item as any)?.attributes?.stock ?? 0);

    // Block if stock is defined (>0) and we're at/over the limit
    if (stock > 0 && currentQty >= stock) {
      const exceedMsg =
        // prefer cart copy, else fall back to products copy, else default
        (languageData[language]?.cart?.exceed as string) ||
        (languageData[language]?.products?.exceed as string) ||
        "Quantity exceeds available stock";
      toast.error(exceedMsg);
      return; // don’t update state
    }

    updated[index].quantity = currentQty + 1;
    sync(updated); // your existing sync to state + localStorage
  };

  const decreaseQty = (index: number) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      sync(updated);
    }
  };

  const removeFromCart = (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    sync(updated);
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    setIsCheckoutLoading(true);
    setIsCartOpen(false);
    router.push("/shipping");
  };

  const cartContent = (
    <>
      {isCartOpen && (
        <div
          onClick={toggleCart}
          className="fixed inset-0 z-50 bg-white/10 backdrop-blur-md transition-opacity duration-300"
        ></div>
      )}

      {/* Cart Drawer */}
      <div
        id="cart"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-white shadow-lg transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        } sm:rounded-l-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <Image
              src={"/images/bag.svg"}
              alt="Cart"
              width={20}
              height={20}
              unoptimized={true}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/bag.svg";
              }}
            />
            <h2 className="text-lg font-semibold">{t.title}</h2>
            {cartItems.length > 0 && (
              <span className="bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={toggleCart}
            className="text-2xl font-bold text-black cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const a = (item as CartItem).attributes || {};
                const title = a.title;
                const images = a.images;

                // Prefer merged per-ITEM gross price, else derive like before
                const storedUnit = Number(a.finalUnitGross ?? NaN);

                let unitGross: number;
                if (!Number.isNaN(storedUnit) && storedUnit > 0) {
                  unitGross = storedUnit;
                } else {
                  // fallback: base + VAT (legacy)
                  const base = Number(a.price ?? 0);
                  const vatRate = Number(a.vatRate ?? 0);
                  unitGross = base + (base * vatRate) / 100;
                }

                const lineTotal = unitGross * (item.quantity ?? 0);

                return (
                  <div
                    key={index}
                    className="flex gap-3 items-start border-b border-[#EEEEEE] pb-4 last:border-none p-2"
                  >
                    <Image
                      src={images?.[0] || "/svg/placeholder.svg"}
                      alt={title}
                      width={64}
                      height={64}
                      className="rounded object-cover w-16 h-16"
                      unoptimized
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {title}
                      </h3>

                      {/* In cart.tsx - update the price display section */}
                      <p className="text-sm text-gray-500 mt-1">
                        {item.selectedPackage
                          ? `${item.selectedPackage.title} - `
                          : ""}
                        {formatCurrency(unitGross)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => decreaseQty(index)}
                            className="px-1 py-0.5 rounded bg-white text-gray-700 border border-[#EEEEEE] cursor-pointer"
                          >
                            <HiMinus size={14} />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() => increaseQty(index)}
                            className="px-1 py-0.5 rounded bg-white text-gray-700 border border-[#EEEEEE] cursor-pointer"
                          >
                            <HiPlus size={14} />
                          </button>
                        </div>
                        <p
                          className="text-sm text-black mt-1 font-bold text-end"
                          title={`${item.quantity} × ${formatCurrency(
                            unitGross
                          )} = ${formatCurrency(lineTotal)}`}
                        >
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty Cart Content */
            <div className="flex flex-col items-center justify-center h-full px-6">
              <Image
                src={"/images/bag.svg"}
                alt="Empty Cart"
                width={60}
                height={60}
                className="mb-4"
                unoptimized={true}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/bag.svg";
                }}
              />
              <h3 className="text-lg font-semibold mb-1">{t.empty}</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">{t.add}</p>
              <button
                onClick={toggleCart}
                className="bg-[var(--primary-red)] text-white px-6 py-2 rounded-md text-sm hover:opacity-90 cursor-pointer"
              >
                {t.continue}
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer with Total and Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 space-y-2">
            {/* Subtotal = sum of unit prices only */}
            {/* <div className="flex justify-between text-sm">
              <span>{t.subtotal}</span>
              <span>
                {formatCurrency(
                  cartItems.reduce((sum, item) => {
                    const a = item.attributes || {};
                    const price = Number(a.price ?? 0);
                    return sum + price * item.quantity;
                  }, 0)
                )}
              </span>
            </div> */}
            {/* VAT total on actual price */}
            {/* <div className="flex justify-between text-sm text-[#00AC7B]">
              <span>
                vat(
                {cartItems.length > 0
                  ? `${Number(cartItems[0].attributes?.vatRate ?? 0)}%`
                  : "0%"}
                ):{" "}
              </span>
              <span>
                {formatCurrency(
                  cartItems.reduce((sum, item) => {
                    const a = item.attributes || {};
                    const price = Number(a.price ?? 0);
                    const vatRate = Number(a.vatRate ?? 0);
                    const vat = (price * vatRate) / 100;
                    return sum + vat * item.quantity;
                  }, 0)
                )}
              </span>
            </div> */}
            {/* Total = Subtotal + VAT */}
            {/* Total = sum of line totals, respecting BE per-pack price */}
            <div className="flex justify-between font-semibold text-lg border-t border-dashed border-[#EEEEEE] pt-2">
              <span>{t.total}</span>
              <span>
                {formatCurrency(
                  cartItems.reduce((sum, item) => {
                    const a = (item as CartItem).attributes || {};
                    const storedUnit = Number(a.finalUnitGross ?? NaN);

                    let unitGross: number;
                    if (!Number.isNaN(storedUnit) && storedUnit > 0) {
                      unitGross = storedUnit;
                    } else {
                      const base = Number(a.price ?? 0);
                      const vatRate = Number(a.vatRate ?? 0);
                      unitGross = base + (base * vatRate) / 100;
                    }
                    return sum + unitGross * (item.quantity ?? 0);
                  }, 0)
                )}
              </span>
            </div>

            <div className="flex justify-between text-xs text-black">
              <span>
                VAT(
                {cartItems.length > 0
                  ? `${Number(cartItems[0].attributes?.vatRate ?? 0)}%`
                  : "0%"}
                ):{" "}
              </span>
              <span>
                {formatCurrency(
                  cartItems.reduce((sum, item) => {
                    const a = item.attributes || {};

                    // Checking if its pkg
                    if (item.selectedPackage) {
                      // For packages: Calculate VAT amount from package price
                      const packagePrice = item.selectedPackage.price;
                      const vatRate = Number(a.vatRate ?? 0);
                      const basePrice = packagePrice / (1 + vatRate / 100);
                      const vatAmount = packagePrice - basePrice;
                      return sum + vatAmount * item.quantity;
                    } else {
                      // For individual items: Calculate VAT as before
                      const price = Number(a.price ?? 0);
                      const vatRate = Number(a.vatRate ?? 0);
                      const vat = (price * vatRate) / 100;
                      return sum + vat * item.quantity;
                    }
                  }, 0)
                )}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className={`mt-4 w-full bg-[var(--primary-red)] text-white font-semibold py-3 rounded transition cursor-pointer flex justify-center items-center ${
                isCheckoutLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-red-600"
              }`}
            >
              {isCheckoutLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin "></div>
              ) : (
                t.checkout
              )}
            </button>
            <p className="text-[#737373] text-xs text-center">{t.shipping}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={toggleCart}
        className="px-4 py-2 rounded-lg cursor-pointer relative"
      >
        <Image
          src={cartIconUrl}
          alt="Cart"
          height={30}
          width={30}
          unoptimized={true}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/cart.svg";
          }}
        />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Portal to body */}
      {typeof window !== "undefined" &&
        createPortal(cartContent, document.body)}
    </>
  );
};

export default CartMenu;
