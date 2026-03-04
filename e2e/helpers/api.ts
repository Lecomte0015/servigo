import { APIRequestContext } from "@playwright/test";

/**
 * Logs in via API (returns cookie automatically on APIRequestContext).
 */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<{ token?: string }> {
  const res = await request.post("/api/auth/login", {
    data: { email, password },
  });
  const body = await res.json();
  return body;
}

/**
 * Creates a job via the API. Assumes the request context is authenticated as CLIENT.
 */
export async function apiCreateJob(
  request: APIRequestContext,
  {
    categoryId,
    city,
    description,
    urgencyLevel = "STANDARD",
  }: {
    categoryId: string;
    city: string;
    description: string;
    urgencyLevel?: "STANDARD" | "URGENT";
  }
): Promise<{ id: string; status: string }> {
  const res = await request.post("/api/jobs", {
    data: { categoryId, city, description, urgencyLevel },
  });
  const body = await res.json();
  if (!res.ok() || !body.success) {
    throw new Error(`createJob failed: ${JSON.stringify(body)}`);
  }
  return body.data;
}

/**
 * Fetches available categories (public).
 */
export async function apiGetCategories(
  request: APIRequestContext
): Promise<Array<{ id: string; name: string }>> {
  const res = await request.get("/api/categories");
  const body = await res.json();
  return body.data ?? [];
}
