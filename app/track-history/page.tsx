"use client";

import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Discover from "@/components/discover";
import ReviewModal from "@/components/reviews-modal/reviews-modal";

// Types
type OrderItem = {
  productName: string;
  quantity: number;
  currency: string;
  unitAmount: number;
  images: string[];
};

type Order = {
  orderId: string;
  orderCode: string;
  createdAt?: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  shipping: {
    userName: string;
    address: string;
    city: string;
    country: string;
    phoneNumber: string;
  } | null;
  items: OrderItem[];
};

type User = {
  city: string;
  country: string;
  createdAt?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

type TrackData = {
  email: string;
  user: User;
  orders: Order[];
};

const Track = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.tracking ?? {};
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatMoney = (amount?: number, currency?: string) => {
    if (amount == null) return "-";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "EUR").toUpperCase(),
        currencyDisplay: "symbol",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency ? "" : "$"}${amount.toFixed(2)}`;
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("track_data")
        : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as TrackData;
        setData(parsed);
        setLoading(false);
        return;
      } catch {}
    }

    const fetchByEmail = async () => {
      if (!emailFromQuery) {
        setLoading(false);
        return;
      }
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL;
        if (!base) throw new Error("Missing NEXT_PUBLIC_BASE_URL");

        const res = await fetch(`${base}/user/shipping-details-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailFromQuery }),
          cache: "no-store",
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to fetch");

        const payload: TrackData = {
          email: json?.data?.email || emailFromQuery,
          user: json?.data?.user,
          orders: json?.data?.payments || [],
        };

        setData(payload);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("track_data", JSON.stringify(payload));
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchByEmail();
  }, [emailFromQuery]);

  console.log("order =>", data);

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };
  const closeModal = () => {
    setReviewModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <section className="px-6 sm:px-20 py-12 mb-20 mt-24 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">{t.title || "Order History"}</h1>
        <p className="text-[#495057] text-base sm:text-base md:text-lg mt-2">
          {t.desc}
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-[#737373]">Loading your details…</p>
        ) : !data ? (
          <div className="mt-6 text-sm text-[#737373]">
            <p>No data found for this session.</p>
            <p className="mt-1">
              Please verify your email again to view your tracking details.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {data.orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl w-full px-6 py-5 shadow-sm overflow-x-auto"
              >
                {/* Customer Info */}
                <div className="customer-info grid grid-cols-2 lg:grid-cols-4 gap-5 border-b pb-4 border-[#EEEEEE] text-sm font-medium text-black">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-[#737373]">
                      {order.shipping?.userName
                        ? order.shipping.userName
                        : `${data.user?.firstName ?? ""} ${
                            data.user?.lastName ?? ""
                          }`}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">{t.email}</p>
                    <p className="text-xs text-[#737373]">{data.user?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{t.phone}</p>
                    <p className="text-xs text-[#737373]">
                      {order.shipping?.phoneNumber}
                    </p>
                  </div>
                  <div className="">
                    <p className="font-semibold">{t.address}</p>
                    <p className="text-xs text-[#737373]">
                      {order.shipping?.city}, {order.shipping?.country}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                {order.items?.map((item, index) => {
                  const isLast = index === order.items.length - 1;
                  return (
                    <div
                      key={`item-${index}`}
                      className="flex flex-col md:flex-row items-center justify-between mt-4"
                    >
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full sm:w-auto">
                        <img
                          src={item.images?.[0] || "/images/product.svg"}
                          alt={item.productName}
                          className="w-[80px] h-auto object-contain rounded-md"
                        />

                        <div className="flex flex-col space-y-2">
                          <p className="font-semibold text-black">
                            {item.productName}
                          </p>
                          <p className="text-sm text-[#737373]">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm text-[#737373]">
                            {t.orderId} {order?.orderCode}
                          </p>
                          <p className="text-sm text-[#737373]">
                            {t.date} {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Show total + button ONLY on the last item row for md+ screens */}
                      {isLast && (
                        <div className="hidden md:flex flex-col items-end mt-4 md:mt-0">
                          <p className="text-lg font-bold text-black">
                            {formatMoney(order.amountTotal, order.currency)}
                          </p>
                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="bg-[#DC2626] text-white px-5 py-2 text-sm rounded-md mt-2 cursor-pointer"
                          >
                            {t.btn}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
      <Discover />
      <ReviewModal
        open={reviewModalOpen}
        order={selectedOrder}
        onClose={closeModal}
      />
    </>
  );
};

export default Track;
