import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
const store = () => getStore({ name: "lmpharma-product-images", consistency: "strong" });
export default async (req: Request) => {
  const key = new URL(req.url).searchParams.get("key") || "";
  if (req.method === "GET" && key) { const blob = await store().get(key, { type: "blob" }) as Blob | null; return blob ? new Response(blob, { headers: { "content-type": blob.type || "image/jpeg", "cache-control": "public,max-age=31536000,immutable" } }) : new Response("Not found", { status: 404 }); }
  const user = await getUser(); const roles = (user?.appMetadata?.roles as string[] | undefined) ?? [];
  if (!user || !roles.includes("admin")) return Response.json({ error: "غير مصرح" }, { status: 401 });
  if (req.method === "POST") { const form = await req.formData(); const file = form.get("file"); if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 5_000_000) return Response.json({ error: "اختر صورة لا تتجاوز 5MB" }, { status: 400 }); const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-"); const imageKey = `${Date.now()}-${crypto.randomUUID()}-${safe}`; await store().set(imageKey, file); return Response.json({ url: `/api/admin-media?key=${encodeURIComponent(imageKey)}` }, { status: 201 }); }
  return new Response("Method not allowed", { status: 405 });
};
export const config: Config = { path: "/api/admin-media" };
