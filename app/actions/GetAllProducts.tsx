"use client";

export async function fetchProductsByCategory(lang: string, category: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!BASE_URL) {
    console.error(":x: BASE_URL is not defined");
    return { success: false, message: "BASE_URL missing", data: [] };
  }

  const url = new URL(`${BASE_URL}/product/list`);
  url.searchParams.append("lang", lang);
  url.searchParams.append("categoryName", category);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(":x: Error fetching products:", error);
    return { success: false, message: "Failed to fetch products", data: [] };
  }
}
