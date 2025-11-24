export const joinUrl = (base: string, path: string) =>
  `${(base || "").replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (!base) {
    throw new Error("NEXT_PUBLIC_BASE_URL is empty.");
  }
  return base;
}

export async function submitShippingClient(payload: unknown) {
  const base = getApiBase();
  const url = joinUrl(base, "/user/user-shiping");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(payload as object) }),
  });

  return res;
}
