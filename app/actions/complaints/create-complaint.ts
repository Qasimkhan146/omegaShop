export async function createComplaint(payload: FormData) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!BASE_URL) {
    console.error("BASE_URL is not defined");
    return { success: false, message: "BASE_URL missing", data: [] };
  }

  const url = `${BASE_URL}/complaint/add`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: payload,
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Something went wrong",error };
  }
}
