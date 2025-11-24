"use client";

export async function fetchProductById(id: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!BASE_URL) {
    console.error("❌ BASE_URL is not defined");
    return { success: false, message: "BASE_URL missing", data: null };
  }

  // Validate the ID
  if (!id || typeof id !== "string") {
    console.error("❌ Invalid product ID");
    return { success: false, message: "Invalid product ID", data: null };
  }

  try {
    const response = await fetch(`${BASE_URL}/product/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const productData = await response.json();

    return {
      success: true,
      message: "Product fetched successfully",
      data: productData,
    };
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return {
      success: false,
      message: "Failed to fetch product",
      data: null,
    };
  }
}
