"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type OrderItemRaw = any;

type OrderItem = {
  uniqueId: string;
  lineItemId?: string;
  productId?: string;
  productName: string;
  images: string[];
  quantity?: number;
  currency?: string;
  unitAmount?: number;
};

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email");

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [reviews, setReviews] = useState<
    Record<string, { rating: number; review: string }>
  >({});

  const handleRating = (uniqueId: string, star: number) => {
    setReviews((prev) => ({
      ...prev,
      [uniqueId]: { rating: star, review: prev[uniqueId]?.review || "" },
    }));
  };

  const handleText = (uniqueId: string, text: string) => {
    setReviews((prev) => ({
      ...prev,
      [uniqueId]: { rating: prev[uniqueId]?.rating || 0, review: text },
    }));
  };
  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!orderId || !email) {
          router.push(
            `/verify-email?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
          return;
        }

        const base = process.env.NEXT_PUBLIC_BASE_URL;
        if (!base) throw new Error("Missing NEXT_PUBLIC_BASE_URL");

        const res = await fetch(
          `${base}/order/single-order?orderId=${orderId}&email=${email}`,
          { method: "GET", credentials: "include" }
        );

        // redirect if access token not provided
        if (res.status === 401) {
          router.push(
            `/verify-email?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
          return;
        }

        const data = await res.json();
        console.log("Fetch order response:", data);

        if (!res.ok) {
          toast.error(data?.message || "Error fetching order");
          setLoading(false);
          return;
        }

        if (!data?.data?.payment) {
          router.push("/verify-email");
          return;
        }

        if (data?.data?.alreadyReviewed) {
          setAlreadyReviewed(true);
          setLoading(false);
          return;
        }

        const rawItems: OrderItemRaw[] = data?.data?.payment?.lineItems || [];

        const mapped: OrderItem[] = rawItems.map((it: any, idx: number) => {
          const lineItemId = it.lineItemId ?? it.id ?? it._id ?? null;
          const productId =
            it.price?.product ?? it.productId ?? it.product?.id ?? null;
          const name =
            it.productName ?? it.name ?? it.description ?? `Product ${idx + 1}`;
          const images =
            Array.isArray(it.images) && it.images.length
              ? it.images
              : ["/images/product.svg"];
          const uniqueId =
            productId ??
            (lineItemId ? `${lineItemId}-${idx}` : `item-${Date.now()}-${idx}`);
          return {
            uniqueId,
            lineItemId,
            productId: productId ?? undefined,
            productName: name,
            images,
            quantity: it.quantity,
            currency: it.currency,
            unitAmount: it.unitAmount,
          };
        });

        setItems(mapped);
      } catch (err) {
        console.error("Fetch order error:", err);
        toast.error("Network error");
        router.push("/verify-email"); // redirect on network error
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, email, router]);

  const handleSubmit = async () => {
    // Check if every item has rating and comment
    for (const item of items) {
      const r = reviews[item.uniqueId];

      if (!r || r.rating === 0) {
        toast.error(`Please provide rating for all products`);
        return;
      }
    }

    const payload = {
      orderId,
      items: items.map((it) => ({
        lineItemId: it.lineItemId,
        rating: reviews[it.uniqueId].rating,
        comment: reviews[it.uniqueId].review.trim(),
      })),
    };

    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${base}/review/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      // redirect if access token not provided
      if (res.status === 401) {
        router.push("/verify-email");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success("Review submitted successfully!");
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
      router.push(
        `/verify-email?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
    }
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-600 text-xl">Loading...</p>
    );
  if (alreadyReviewed)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <Image
            src="/images/cross.svg"
            alt="checked"
            width={70}
            height={70}
            className="mx-auto mb-4"
          />

          <h2 className="text-2xl font-bold text-black mb-2">
            Review Already Submitted
          </h2>

          <p className="text-gray-700 mb-6">
            You have already submitted a review for this order.
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-[var(--primary-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 w-full"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );

  if (submitted)
    return (
      <div className="text-center mt-20 p-6 flex flex-col items-center">
        <Image src="/images/correct.svg" alt="success" width={80} height={80} />
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Thanks for submitting your review!
        </h2>
        <p className="text-gray-700 mb-6">
          We really appreciate your feedback.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-[var(--primary-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
        >
          Back to Home
        </button>
      </div>
    );

  if (!items.length)
    return (
      <p className="text-center mt-20 text-red-500 text-xl">No items found.</p>
    );

  // ...render items and review form as before
  return (
    <div className="container mx-auto p-6 px-10 sm:px-20 mt-20">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Tell Us What You Think
      </h2>
      <p className="text-gray-600 mb-6">
        We’d love to hear your thoughts! Your feedback helps us to improve.
      </p>

      {items.map((item) => {
        const selectedRating = reviews[item.uniqueId]?.rating || 0;
        const selectedReview = reviews[item.uniqueId]?.review || "";

        return (
          <div
            key={item.uniqueId}
            className="mb-6 bg-white rounded-2xl shadow-md border-2 border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-6">
              <div className="bg-white p-2.5 rounded-xl shadow-lg">
                <Image
                  src={item.images[0]}
                  alt={item.productName}
                  width={100}
                  height={100}
                  className="w-30 h-30 object-contain m-4"
                />
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-red)]">
                {item.productName}
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Rating
              </label>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(item.uniqueId, star)}
                  >
                    <Image
                      src={
                        star <= selectedRating
                          ? "/images/rating-star-filled.svg"
                          : "/images/rating-star.svg"
                      }
                      alt="star"
                      width={24}
                      height={24}
                      className="w-6 h-6 cursor-pointer"
                    />
                  </button>
                ))}
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your experience..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                value={selectedReview}
                onChange={(e) => handleText(item.uniqueId, e.target.value)}
              />
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[var(--primary-red)] text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          Submit Review
          <Image src="/images/frame.svg" width={20} height={20} alt="frame" />
        </button>
      </div>
    </div>
  );
}
