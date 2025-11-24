export async function verifyOtpAndSaveShipping(otp: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_BASE_URL");

  const url = `${base}/user/shipping-detils`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp: otp.trim() }),
    cache: "no-store",
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      (data as { message?: string; error?: string })?.message ||
        (data as { message?: string; error?: string })?.error ||
        `Request failed ${res.status}`
    );
  }

  return data;
}
