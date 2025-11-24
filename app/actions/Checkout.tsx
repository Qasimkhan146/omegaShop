"use client";
export interface CartItem {
  attributes: {
    title: string;
    price?: number | string;
    vatRate?: number | string;
    vatAmount?: number | string;
    discount?: number | string;
    finalPrice?: number | string;
    images?: string[];
    finalUnitGross?: number | string;
    packages?: Array<{
      title?: string;
      price?: number | string;
      stock?: number | string;
      images?: string[];
    }>;
  };
  id: string;
  quantity: number;
  selectedPackage?: {
    title?: string;
    price?: number | string;
    stock?: number | string;
    images?: string[];
  };
}
type ShippingPayload = {
  phoneNumber: string;
  address: string;
  country: string; // use "DE", etc.
  city: string;
  region: string; // use "BE", etc.
  postalCode: string;
  userName: string;
  companyName?: string;
};

// helper to parse number
const num = (v: number | string | undefined, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (v: number) => parseFloat(v.toFixed(2));

// compute final price per unit
const computeUnitFinal = (a: CartItem["attributes"]) => {
  const fromAttr = num(a.finalPrice);
  if (fromAttr > 0) return round2(fromAttr);

  const price = num(a.price);
  const vatRate = num(a.vatRate);
  const discount = num(a.discount);

  const vatAmount = Number.isFinite(Number(a.vatAmount))
    ? num(a.vatAmount)
    : (price * vatRate) / 100;

  const final = price + vatAmount - discount;
  return round2(Math.max(0, final));
};

// sanitize image URL helper
const sanitizeImageUrl = (u?: string | null) => {
  if (!u) return null;
  const enc = encodeURI(u);
  try {
    const parsed = new URL(enc);
    if (parsed.protocol !== "https:") return null;
    return enc;
  } catch {
    return null;
  }
};

export async function Checkout(params: {
  cartItems: CartItem[];
  userEmail: string;
  shipping: ShippingPayload;
  currency?: "eur" | "usd" | string;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const SUCCESS_URL = process.env.NEXT_PUBLIC_FE_SUCCESS_URL;
  const FAILED_URL = process.env.NEXT_PUBLIC_FE_FAILED_URL;

  if (!BASE_URL) {
    console.error("❌ NEXT_PUBLIC_BASE_URL is missing");
    return { success: false, message: "BASE_URL missing", data: [] };
  }
  if (!SUCCESS_URL || !FAILED_URL) {
    console.error("❌ Success/Cancel URLs are missing");
    return { success: false, message: "Success/Cancel URLs missing", data: [] };
  }

  // Build items exactly like your Postman body expects
  const items = params.cartItems.map((item) => {
    const a = item.attributes || {};
    const sel = item.selectedPackage;
    const id = item.id;

    const productName = sel?.title ? `${a.title} (${sel.title})` : a.title;

    // Prefer per-unit gross if present, else package price, else computed final
    const computedFinal = computeUnitFinal(a);
    const finalUnitPrice = round2(
      num(a.finalUnitGross, num(sel?.price, computedFinal))
    );

    // Prefer package image, then product image, then nothing
    const rawPkgImg = sel?.images?.[0] || null;
    const rawItemImg = a.images?.[0] || null;
    const productImage =
      sanitizeImageUrl(rawPkgImg) || sanitizeImageUrl(rawItemImg) || null;

    return {
      id,
      productName,
      productImage,
      price: finalUnitPrice,
      quantity: item.quantity,
    };
  });
  console.log(items, 4, "ITEMS");
  const body = {
    userEmail: params.userEmail,
    shipping: params.shipping,
    items,
    successUrl: SUCCESS_URL,
    cancelUrl: FAILED_URL,
    currency: params.currency ?? "eur",
  };

  try {
    const res = await fetch(`${BASE_URL}/payment/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = `Checkout failed: ${res.status}`;
      try {
        const err = await res.json();
        if (err?.message) msg = err.message;
      } catch {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (e) {
    console.error("❌ Error during checkout:", e);
    return { success: false, message: "Checkout failed", data: [] };
  }
}
