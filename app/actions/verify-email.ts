type ApiErrorShape = { message?: string; error?: string };

export async function requestEmailVerification(email: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  if (!base) throw new Error("Missing NEXT_PUBLIC_BASE_URL or BASE_URL");

  const url = `${base}/user/email-verification`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const d = (data as ApiErrorShape) || {};
    const message =
      d.message || d.error || text || `Request failed ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function resendVerificationEmail(email: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  if (!base) throw new Error("Missing NEXT_PUBLIC_BASE_URL or BASE_URL");

  const url = `${base}/user/email-verification`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const d = (data as ApiErrorShape) || {};
    const message =
      d.message || d.error || text || `Request failed ${res.status}`;
    throw new Error(message);
  }

  return data;
}
