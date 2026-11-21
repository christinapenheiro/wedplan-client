/**
 * Central fetch utility for client-side API calls.
 * Reads NEXT_PUBLIC_SERVER_URL from env so callers never hardcode the base URL.
 */
// import { authClient } from "../auth-client";



const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

//get client session

// async function clientSession() {
//   const {data: session} = await authClient.getSession()
//   const token = session?.session?.token
//   return token
// }


/** Generic request wrapper — throws on non-2xx responses */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const clientApi = {
  /** GET request */
  get: <T>(path: string, token?: string) =>
    request<T>(path, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),

  /** POST request with a JSON body */
  post: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),

  /** PUT request with a JSON body */
  put: <T>(path: string, token: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),

  /** DELETE request */
  delete: <T>(path: string,token:string) =>
    request<T>(path, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
