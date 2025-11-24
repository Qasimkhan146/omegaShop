"use client";

import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Review from "@/components/review";
import Panel2 from "@/components/panel2";
import ProductCarousel from "@/components/productCarousel";
import ExploreCarousel from "@/components/exploreCarousel";
import FAQs from "@/components/faq";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProductById } from "../actions/GetSingleProduct";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiResponse, ProductData } from "@/types/product";
import { HiMinus, HiPlus } from "react-icons/hi";
import { toast } from "react-hot-toast";
import Carousel from "@/components/carousel";
import Skeleton from "@/components/skeleton";
import Discover from "@/components/discover";
import ReviewsDataCarousel from "@/components/reviewsDataCarousel";
import AverageStars from "@/components/AverageRating";

const Shop = () => {
  const {
    language,
    setCartItems,
    cartItems,
    productsByCategory,
    loadProductsByCategory,
  } = useLanguage();
  const t = languageData[language]?.shop ?? {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const toastShownRef = useRef(false);

  // Add to your existing state in shop/page.tsx
  const [selectedPackage, setSelectedPackage] = useState<{
    title: string;
    price: number;
    stock: number;
  } | null>(null);

  // Package selection handler
  const handlePackageSelect = (packageItem: {
    title: string;
    price: number;
    stock: number;
  }) => {
    if (selectedPackage?.title === packageItem.title) {
      setSelectedPackage(null);
      setQuantity(1);
    } else {
      setSelectedPackage(packageItem);
      setQuantity(packageItem.stock);
    }
  };

  // Add to your existing CartItem type
  type CartItem = ProductData & {
    quantity: number;
    selectedPackage?: {
      title: string;
      price: number;
      stock: number;
    };
    isPackage?: boolean;
  };

  const asCart = (arr: typeof cartItems) => arr as unknown as CartItem[];

  const existingId = productsByCategory?.wallet?.data?.[0]?.id ?? null;
  const finalProductId = productId ?? existingId;

  const normalizeProductPricing = (p: ProductData): ProductData => {
    const attrs = p?.attributes;
    const price = Number(attrs.price ?? 0);
    const discount = Number(attrs.discount ?? 0);
    const vatRate = Number(attrs.vatRate ?? 0);
    const preOrder = attrs.preOrder ?? "";

    const vatAmount = (price * vatRate) / 100;
    const finalPrice = Math.max(0, price + vatAmount - discount);

    return {
      ...p,
      attributes: {
        ...attrs,
        price,
        discount,
        vatRate,
        vatAmount,
        finalPrice,
        preOrder,
      },
    };
  };

  const [productData, setProductData] = useState<ApiResponse<
    ProductData[]
  > | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductsByCategory("wallet", language.toLowerCase());
  }, []);

  useEffect(() => {
    setLoading(true);

    if (!finalProductId) {
      setLoading(false);
      return;
    }

    fetchProductById(finalProductId)
      .then((resp) => {
        const product = resp?.data?.data;
        const normalized = product ? [normalizeProductPricing(product)] : [];
        setProductData({
          status: 200,
          success: Boolean(resp?.success && normalized.length),
          message: resp?.message ?? "OK",
          data: normalized,
        });
      })
      .catch()
      .finally(() => setLoading(false));
  }, [finalProductId]);

  const product = productData?.data?.[0];
  const productReviews = product?.attributes?.reviews ?? [];
  console.log("productReviews>>>>>>>>>>>", product);

  // Update your increment/decrement functions
  const incrementQuantity = () => {
    setQuantity((prev) => {
      const maxStock =
        selectedPackage?.stock ?? product?.attributes?.stock ?? 1;
      const nextQty = prev + 1;

      if (nextQty > maxStock) {
        if (!toastShownRef.current) {
          toast.error("Quantity exceeds available stock");
          toastShownRef.current = true;
          setTimeout(() => (toastShownRef.current = false), 500);
        }
        return prev;
      }

      return nextQty;
    });
  };

  const decrementQuantity = () => {
    setQuantity((prev) => {
      const step = selectedPackage ? selectedPackage.stock : 1;
      const min = selectedPackage ? selectedPackage.stock : 1;
      return prev > min ? prev - step : min;
    });
  };

  // handle add to cart
  const handleAddToCart = (product: ProductData) => {
    const safeProduct = normalizeProductPricing(product);

    // Calculate unit price based on package or individual
    const unitPrice = selectedPackage
      ? selectedPackage.price
      : Number(safeProduct.attributes.finalPrice ?? 0);

    // If no package, use the normal quantity
    const cartQuantity = selectedPackage ? 1 : quantity;

    setCartItems((prev) => {
      const next: CartItem[] = [...asCart(prev)];

      const idx = next.findIndex((i) => {
        // Match by product ID AND package selection
        if (i.id !== safeProduct.id) return false;
        const hasSamePackage =
          i.selectedPackage?.title === selectedPackage?.title;
        return hasSamePackage;
      });

      if (idx >= 0) {
        const existing = next[idx];
        const maxStock =
          selectedPackage?.stock ?? safeProduct?.attributes?.stock ?? 1;
        const additionalQty = selectedPackage ? 1 : quantity;
        const proposedQty = existing.quantity + additionalQty;

        if (proposedQty > maxStock) {
          toast.error(t.section1?.exceed || "Quantity exceeds available stock");
          return prev;
        }

        next[idx] = {
          ...existing,
          quantity: proposedQty,
          attributes: {
            ...existing.attributes,
            finalUnitGross: unitPrice,
          } as CartItem["attributes"] & { finalUnitGross: number },
        };
      } else {
        if (
          (selectedPackage?.stock ?? safeProduct?.attributes?.stock ?? 0) <
          cartQuantity
        ) {
          toast.error(t.section1?.exceed || "Quantity exceeds available stock");
          return prev;
        }

        next.push({
          ...safeProduct,
          quantity: cartQuantity,
          selectedPackage: selectedPackage || undefined,
          isPackage: !!selectedPackage,
          attributes: {
            ...safeProduct.attributes,
            finalUnitGross: unitPrice,
          } as CartItem["attributes"] & { finalUnitGross: number },
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(next));
      if (!toastShownRef.current) {
        toast.success(t.section1.added || "Product added to cart");
        toastShownRef.current = true;
        setTimeout(() => (toastShownRef.current = false), 300);
      }
      return next as unknown as typeof prev;
    });

    // Reset states
    setQuantity(1);
    setSelectedPackage(null);
  };

  const recommendedProducts = useMemo(() => {
    const list = productsByCategory?.wallet?.data ?? [];
    return list.slice().reverse();
  }, [productsByCategory?.wallet?.data]);

  const notMatchedProducts = useMemo(() => {
    if (!product) return recommendedProducts;
    return recommendedProducts.filter((p) => p.id !== product.id);
  }, [recommendedProducts, product]);

  const notMatchedProduct =
    notMatchedProducts[0] ?? recommendedProducts[0] ?? null;
  const productImages = product?.attributes?.images ?? [];
  const exploreProudct = notMatchedProduct?.attributes;
  const exploreProductImages = exploreProudct?.images;

  // handle learn more
  const handleLearnMore = () => {
    if (!notMatchedProduct?.id) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("id", notMatchedProduct.id);
    router.push(`?${params.toString()}`, { scroll: false });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const normalizedExploreProduct = exploreProudct
    ? normalizeProductPricing({ ...notMatchedProduct }).attributes
    : null;

  const StockStatusBadge = ({
    stock,
    preOrder,
    t,
  }: {
    stock: number;
    preOrder?: string;
    t: any;
  }) => {
    const showPreOrder = preOrder && preOrder.trim() !== "";

    // Out of Stock
    if (stock <= 0) {
      return (
        <div className="relative group inline-block">
          <button className="bg-red-100 border border-red-500 text-red-600 py-1 px-3 rounded text-xs sm:text-sm">
            {t.section1.outstock}
          </button>

          <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition rounded bg-black text-white text-xs py-1 px-2 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap">
            {t.section1.outstock}
          </span>
        </div>
      );
    }

    // Pre-Order
    return (
      <div className="relative group inline-block">
        <button className="bg-green-100 border border-green-500 text-green-600 py-1 px-3 rounded text-xs sm:text-sm">
          {t.section1.preOrder ?? "Pre-Order"}
        </button>
        <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition rounded bg-[#FFEDED] text-black text-xs py-1 px-2 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap">
          {preOrder}
        </span>
      </div>
    );
  };

  const stockAvailable =
    selectedPackage?.stock ?? product?.attributes?.stock ?? 0;

  const exploreStock = notMatchedProduct?.attributes?.stock ?? 0;

  if (loading) {
    return (
      <section className="px-10 sm:px-20 py-15 mt-15 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <div className="flex flex-col gap-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="shop">
        <section className="px-10 sm:px-20 py-15 mt-15 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-6 lg:gap-0">
            <div className="flex items-center justify-center">
              <ProductCarousel productImages={productImages ?? []} />
            </div>
            <div className="md:p-4 flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-1">
                  {/* <Image
                    src="/images/star.svg"
                    alt="icon"
                    height={100}
                    width={100}
                  ></Image> */}
                  {/* rating stars */}
                  <div className="flex flex-row gap-1">
                    <AverageStars
                      rating={product?.attributes?.averageRating || 0}
                    />
                  </div>
                  <p className="text-xs text-[#737373]">
                    {"("}
                    {product?.attributes.totalReviews} reviews{")"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {product?.attributes.title}
                </h1>
                <p className="text-sm sm:text-lg text-[#737373]">
                  {product?.attributes.description}
                </p>
              </div>
              <div>
                <p className="text-[var(--primary-red)] text-base sm:text-lg font-semibold">
                  {t.section1.features}
                </p>
                <ul className="list-disc list-outside pl-4 text-black space-y-1 mt-2">
                  {t.section1.list?.map((feature, idx) => (
                    <li key={idx} className="text-xs sm:text-base">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {product?.attributes.packages &&
                product.attributes.packages.length > 0 && (
                  <div className="">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                      {product.attributes.packages.map(
                        (packageItem: any, index) => {
                          const isSelected =
                            selectedPackage?.title === packageItem.title;

                          return (
                            <div
                              key={index}
                              onClick={() => handlePackageSelect(packageItem)}
                              className={`border rounded-lg p-2 cursor-pointer transition-all flex flex-row justify-between items-center ${
                                isSelected
                                  ? "border-[var(--primary-red)] bg-red-50"
                                  : "border-[#EEEEEE] bg-white"
                              }`}
                            >
                              <p
                                className={`font-semibold text-sm ${
                                  isSelected
                                    ? "text-[var(--primary-red)]"
                                    : "text-black"
                                }`}
                              >
                                {packageItem.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                €{packageItem.price.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* price div */}
              <div className="bg-[#FAFAFA] border border-[#EEEEEE] p-4 rounded-md">
                <div className="flex flex-row justify-between">
                  <div>
                    <div className="flex flex-row gap-2 items-center">
                      <p className="text-black font-bold text-lg">
                        €
                        {selectedPackage
                          ? selectedPackage.price.toFixed(2)
                          : product?.attributes.finalPrice.toFixed(2) ?? 0}
                      </p>

                      <p className="text-xs sm:text-sm text-[#737373]">
                        {t.section1.included}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-[#737373]">
                      {t.section1.shipping}
                    </div>
                  </div>
                  <div>
                    <StockStatusBadge
                      stock={
                        selectedPackage?.stock ??
                        product?.attributes?.stock ??
                        0
                      }
                      preOrder={product?.attributes?.preOrder}
                      t={t}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-3 w-full mt-4 items-stretch buttons">
                  <div className="bg-white border border-[#EEEEEE] rounded-md flex items-center justify-between py-2 px-3 w-fit gap-3">
                    <button
                      onClick={decrementQuantity}
                      className="text-black text-lg font-medium bg-white border border-[#EEEEEE] px-2 rounded-md cursor-pointer"
                    >
                      <HiMinus size={16} />
                    </button>
                    <span className="text-black text-center text-sm font-medium w-[12px]">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="text-black text-lg font-medium bg-white border border-[#EEEEEE] px-2 rounded-md cursor-pointer"
                    >
                      <HiPlus size={16} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        if (stockAvailable > 0 && product) {
                          handleAddToCart(product);
                        }
                      }}
                      disabled={stockAvailable <= 0}
                      className={`h-full w-full p-2 rounded-md flex items-center flex-row justify-center gap-2 
                            ${
                              stockAvailable > 0
                                ? "bg-[var(--primary-red)] text-white cursor-pointer"
                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                            }
                             `}
                    >
                      <Image
                        src="/images/whiteCart.svg"
                        alt="icon"
                        height={20}
                        width={20}
                      ></Image>
                      {t.section1.cart}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Section */}
          <div className="container flex flex-col md:flex-row justify-around items-center text-black mt-5 md:mt-10 mx-auto">
            <div>
              <h2 className="text-xl font-bold">2 Year</h2>
              <p>Warranty</p>
            </div>
            <div className="w-1 h-20 bg-gray-100 my-2"></div>
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {product?.attributes?.preOrder}
              </h2>
              <p>Shipping</p>
            </div>
            <div className="w-1 h-20 bg-gray-100"></div>
            <div>
              <h2 className="text-xl font-bold">24/7</h2>
              <p>Support</p>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="mt-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              {t.details.title}
            </h2>
            <p className="text-[#495057] text-xs sm:text-lg mb-8">
              {t.details.description}
            </p>

            {/* Tabs Header (Separate) */}
            <div className="flex w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg overflow-hidden mb-6 p-4 gap-2 md:gap-4">
              {t.details.tabs?.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-3 text-sm sm:text-base font-medium transition-colors rounded-md ${
                    activeTab === idx
                      ? "bg-[var(--primary-red)] text-white"
                      : "text-black hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content (Separate) */}
            <div className="p-6 rounded-lg">
              {activeTab === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(t.details.tabs[0].content as string[])?.map(
                    (feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EEEEEE] p-3 rounded-lg"
                      >
                        <Image
                          src="/images/tick.svg"
                          alt="icon"
                          height={15}
                          width={15}
                        ></Image>
                        <p className="text-sm sm:text-base font-medium">
                          {feature}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 1 && (
                <div className="overflow-x-auto px-0 md:px-5 lg:px-10 md:mx-10 lg:mx-20 rounded-lg bg-[#FAFAFA] border border-[#EEEEEE]">
                  <table className="w-full">
                    <tbody>
                      {(
                        t.details.tabs[1].content as {
                          spec: string;
                          value: string;
                        }[]
                      )?.map((row, i) => (
                        <tr
                          key={i}
                          className=" border-b border-[#EEEEEE] mb-2 justify-between flex"
                        >
                          <td className="py-3 px-4 text-xs sm:text-base text-black font-semibold">
                            {row.spec}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-base text-[#050505] whitespace-nowrap">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* backup section */}
          <div className="mt-13">
            <h1 className="text-black font-bold text-2xl sm:text-3xl md:text-[34px] lg:text-[42px] text-center md:text-start">
              {t.backup.title}
            </h1>
            <p className="text-[#495057] text-sm sm:text-base md:text-lg lg:text-xl text-center md:text-start">
              {t.backup.desc}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
              <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg p-4">
                <h1 className="text-[var(--primary-red)] font-bold text-[22px]">
                  {t.backup.card1title}
                </h1>
                <p className="mt-3 text-sm sm:text-base">
                  {t.backup.card1desc}
                </p>
                <ul className="list-disc list-outside mt-3 space-y-1 pl-4 text-sm sm:text-base">
                  {t.backup.list1.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg p-4">
                <h1 className="text-[var(--primary-red)] font-bold text-[22px]">
                  {t.backup.card2title}
                </h1>
                <ol className="list-decimal list-outside mt-3 space-y-1 pl-4 text-sm sm:text-base">
                  {t.backup.list2.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        <Carousel />
        <div className="container mx-auto px-10">
          <ReviewsDataCarousel reviews={productReviews} />
        </div>

        <Review />

        {/* explore products  */}
        {notMatchedProduct && notMatchedProduct ? (
          <>
            {/* === First product (unchanged layout) === */}
            <section className="px-10 sm:px-20 py-15 max-w-7xl mx-auto">
              {/* above text */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-[42px] font-bold">
                  {`Explore ${exploreProudct?.title}`}
                </h1>
                <p className="text-base sm:text-lg text-[#495057]">
                  {exploreProudct?.description}
                </p>
              </div>
              {/* grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 mt-6">
                {/* left grid */}
                <div className="flex items-center justify-center">
                  <ExploreCarousel productImages={exploreProductImages} />
                </div>
                {/* right grid */}
                <div className="p-4">
                  {/* heading */}
                  <h1 className="text-[var(--primary-red)] text-2xl sm:text-4xl font-bold">
                    {exploreProudct?.title}
                  </h1>
                  <p className="text-sm sm:text-lg text-[#495057] mt-2">
                    {exploreProudct?.description}
                  </p>
                  {/* details */}
                  <div className="mt-6 space-y-6">
                    {t.section2.details?.map((item, idx) => (
                      <div key={idx} className="pb-2">
                        <h3 className="font-semibold text-lg sm:text-xl">
                          {item.question}
                        </h3>
                        <p className="text-[#495057] mt-2 text-sm sm:text-base">
                          {item.answer}
                        </p>

                        {item.list && (
                          <ul className="list-disc list-outside mt-2 space-y-1 text-black text-xs sm:text-sm pl-4">
                            {item.list.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-row justify-between items-center">
                    <div>
                      <div className="flex flex-row gap-2 items-center">
                        <p className="text-black font-bold text-lg">
                          €{normalizedExploreProduct?.finalPrice?.toFixed(2)}
                        </p>

                        <p className="text-xs sm:text-sm text-[#737373]">
                          {t.section1.included}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-[#737373]">
                        {t.section1.shipping}
                      </div>
                    </div>
                    <StockStatusBadge
                      stock={notMatchedProduct?.attributes?.stock ?? 0}
                      t={t}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                      onClick={() => {
                        if (exploreStock > 0 && notMatchedProduct) {
                          handleAddToCart(notMatchedProduct);
                        }
                      }}
                      disabled={exploreStock <= 0}
                      className={`px-6 py-2 rounded-lg font-medium w-full 
                             ${
                               exploreStock > 0
                                 ? "bg-[var(--primary-red)] text-white cursor-pointer"
                                 : "bg-gray-300 text-gray-600 cursor-not-allowed"
                             }
                              `}
                    >
                      {t.section2.add}
                    </button>

                    <button
                      onClick={handleLearnMore}
                      className={`px-6 py-2 rounded-lg font-medium w-full cursor-pointer ${"bg-transparent text-black border"}`}
                    >
                      {t.section2.learn}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Show more button only if there are more products */}
            {notMatchedProducts.length > 1 && !showMore && (
              <div className="flex items-center justify-center pb-4 ">
                <button
                  onClick={() => setShowMore(true)}
                  className="cursor-pointer border px-3 py-2 rounded-xl"
                >
                  Show more
                </button>
              </div>
            )}

            {/* === Additional products (same styling block repeated) === */}
            {showMore &&
              notMatchedProducts.slice(1).map((itm: ProductData) => {
                const attrs = itm?.attributes || {};
                const images = attrs.images;
                const itemStock = attrs?.stock ?? 0;
                const normAttrs = normalizeProductPricing({
                  ...itm,
                }).attributes;

                return (
                  <section
                    key={itm.id}
                    className="px-10 sm:px-20 py-15 max-w-7xl mx-auto"
                  >
                    {/* above text */}
                    <div className="flex flex-col gap-2">
                      <h1 className="text-3xl sm:text-[42px] font-bold">
                        {`Explore ${attrs?.title}`}
                      </h1>
                      <p className="text-base sm:text-lg text-[#495057]">
                        {attrs?.description}
                      </p>
                    </div>

                    {/* grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 mt-6">
                      {/* left grid */}
                      <div className="flex items-center justify-center">
                        <ExploreCarousel productImages={images} />
                      </div>

                      {/* right grid */}
                      <div className="p-4">
                        {/* heading */}
                        <h1 className="text-[var(--primary-red)] text-2xl sm:text-4xl font-bold">
                          {attrs?.title}
                        </h1>
                        <p className="text-sm sm:text-lg text-[#495057] mt-2">
                          {attrs?.description}
                        </p>

                        {/* details */}
                        <div className="mt-6 space-y-6">
                          {t.section2.details?.map((item, idx) => (
                            <div key={idx} className="pb-2">
                              <h3 className="font-semibold text-lg sm:text-xl">
                                {item.question}
                              </h3>
                              <p className="text-[#495057] mt-2 text-sm sm:text-base">
                                {item.answer}
                              </p>

                              {item.list && (
                                <ul className="list-disc list-outside mt-2 space-y-1 text-black text-xs sm:text-sm pl-4">
                                  {item.list.map((point, i) => (
                                    <li key={i}>{point}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-auto flex flex-row justify-between items-center">
                          <div>
                            <div className="flex flex-row gap-2 items-center">
                              <p className="text-black font-bold text-lg">
                                €
                                {Number(
                                  normAttrs?.finalPrice.toFixed(2) ?? 0
                                ).toFixed(2)}
                              </p>

                              <p className="text-xs sm:text-sm text-[#737373]">
                                {t.section1.included}
                              </p>
                            </div>
                            <div className="text-xs sm:text-sm text-[#737373]">
                              {t.section1.shipping}
                            </div>
                          </div>
                          <StockStatusBadge stock={attrs?.stock ?? 0} t={t} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          <button
                            onClick={() => {
                              if (itemStock > 0) {
                                handleAddToCart(itm);
                              }
                            }}
                            disabled={itemStock <= 0}
                            className={`px-6 py-2 rounded-lg font-medium w-full 
                             ${
                               itemStock > 0
                                 ? "bg-[var(--primary-red)] text-white cursor-pointer"
                                 : "bg-gray-300 text-gray-600 cursor-not-allowed"
                             }
                           `}
                          >
                            {t.section2.add}
                          </button>

                          <button
                            onClick={() => {
                              const params = new URLSearchParams(
                                Array.from(searchParams.entries())
                              );
                              params.set("id", itm.id);
                              router.push(`?${params.toString()}`, {
                                scroll: false,
                              });
                              if (typeof window !== "undefined") {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            className={`px-6 py-2 rounded-lg font-medium w-full cursor-pointer ${"bg-transparent text-black border"}`}
                          >
                            {t.section2.learn}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
          </>
        ) : (
          <section className="px-10 sm:px-20 py-15 max-w-7xl mx-auto">
            <div className="flex justify-center py-5">
              No explored products found!
            </div>
          </section>
        )}

        <Panel2 />
        <FAQs />
        <Discover />
      </section>
    </>
  );
};

export default Shop;
