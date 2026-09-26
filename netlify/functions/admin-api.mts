import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { categories, customers, orders, products, storeSettings } from "../../db/schema.js";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });
const bad = (message: string, status = 400) => json({ error: message }, status);
const slugify = (v: string) => v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\u0600-\u06ff]+/g, "-").replace(/^-|-$/g, "");

async function authorize() {
  const user = await getUser();
  const roles = (user?.appMetadata?.roles as string[] | undefined) ?? [];
  return user && roles.includes("admin") ? user : null;
}

export default async (req: Request) => {
  if (!(await authorize())) return bad("غير مصرح لك بالوصول", 401);
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "overview";
  const id = Number(url.searchParams.get("id"));
  try {
    if (resource === "overview" && req.method === "GET") {
      const [[p], [o], [c], [sales], recent] = await Promise.all([
        db.select({ value: sql<number>`count(*)::int` }).from(products), db.select({ value: sql<number>`count(*)::int` }).from(orders), db.select({ value: sql<number>`count(*)::int` }).from(customers), db.select({ value: sql<string>`coalesce(sum(${orders.total}), 0)` }).from(orders).where(and(sql`${orders.status} != 'cancelled'`)), db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
      ]);
      return json({ stats: { products: p.value, orders: o.value, customers: c.value, sales: sales.value }, recent });
    }
    if (resource === "products") {
      if (req.method === "GET") return json(await db.select({ id: products.id, name: products.name, slug: products.slug, description: products.description, price: products.price, oldPrice: products.oldPrice, discount: products.discount, images: products.images, categoryId: products.categoryId, categoryName: categories.name, inStock: products.inStock, featured: products.featured, createdAt: products.createdAt }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt)));
      const b = await req.json();
      const values = { name: String(b.name || "").trim(), slug: slugify(b.slug || b.name || ""), description: String(b.description || ""), price: String(Number(b.price || 0)), oldPrice: b.oldPrice ? String(Number(b.oldPrice)) : null, discount: Math.max(0, Math.min(100, Number(b.discount || 0))), images: Array.isArray(b.images) ? b.images : [], categoryId: b.categoryId ? Number(b.categoryId) : null, inStock: Boolean(b.inStock), featured: Boolean(b.featured), updatedAt: new Date() };
      if (!values.name || Number(values.price) < 0) return bad("تحقق من اسم المنتج وسعره");
      if (req.method === "POST") return json((await db.insert(products).values(values).returning())[0], 201);
      if (req.method === "PUT" && id) return json((await db.update(products).set(values).where(eq(products.id, id)).returning())[0]);
      if (req.method === "DELETE" && id) { await db.delete(products).where(eq(products.id, id)); return json({ ok: true }); }
    }
    if (resource === "categories") {
      if (req.method === "GET") return json(await db.select().from(categories).orderBy(desc(categories.createdAt)));
      const b = await req.json(); const values = { name: String(b.name || "").trim(), slug: slugify(b.slug || b.name || ""), description: String(b.description || "") };
      if (!values.name) return bad("اسم التصنيف مطلوب");
      if (req.method === "POST") return json((await db.insert(categories).values(values).returning())[0], 201);
      if (req.method === "PUT" && id) return json((await db.update(categories).set(values).where(eq(categories.id, id)).returning())[0]);
      if (req.method === "DELETE" && id) { await db.delete(categories).where(eq(categories.id, id)); return json({ ok: true }); }
    }
    if (resource === "customers") {
      if (req.method === "GET") return json(await db.select().from(customers).orderBy(desc(customers.createdAt)));
      const b = await req.json(); const values = { name: String(b.name || "").trim(), phone: String(b.phone || "").trim(), address: String(b.address || "") };
      if (!values.name || !values.phone) return bad("الاسم والهاتف مطلوبان");
      if (req.method === "POST") return json((await db.insert(customers).values(values).returning())[0], 201);
      if (req.method === "PUT" && id) return json((await db.update(customers).set(values).where(eq(customers.id, id)).returning())[0]);
      if (req.method === "DELETE" && id) { await db.delete(customers).where(eq(customers.id, id)); return json({ ok: true }); }
    }
    if (resource === "orders") {
      if (req.method === "GET") return json(await db.select().from(orders).orderBy(desc(orders.createdAt)));
      const b = await req.json(); const values = { orderNumber: String(b.orderNumber || `LMP-${Date.now().toString().slice(-8)}`), customerId: b.customerId ? Number(b.customerId) : null, customerName: String(b.customerName || "").trim(), phone: String(b.phone || "").trim(), address: String(b.address || ""), products: Array.isArray(b.products) ? b.products : [], total: String(Number(b.total || 0)), status: String(b.status || "new"), notes: String(b.notes || ""), updatedAt: new Date() };
      if (!values.customerName || !values.phone) return bad("بيانات الزبون مطلوبة");
      if (req.method === "POST") return json((await db.insert(orders).values(values).returning())[0], 201);
      if (req.method === "PUT" && id) return json((await db.update(orders).set(values).where(eq(orders.id, id)).returning())[0]);
      if (req.method === "DELETE" && id) { await db.delete(orders).where(eq(orders.id, id)); return json({ ok: true }); }
    }
    if (resource === "settings") {
      if (req.method === "GET") return json((await db.select().from(storeSettings).limit(1))[0] || {});
      const b = await req.json(); const values = { storeName: String(b.storeName || "LMPharma"), phone: String(b.phone || ""), whatsapp: String(b.whatsapp || ""), address: String(b.address || ""), deliveryFee: String(Number(b.deliveryFee || 0)), freeDeliveryThreshold: String(Number(b.freeDeliveryThreshold || 0)), updatedAt: new Date() };
      const current = (await db.select().from(storeSettings).limit(1))[0];
      return json(current ? (await db.update(storeSettings).set(values).where(eq(storeSettings.id, current.id)).returning())[0] : (await db.insert(storeSettings).values(values).returning())[0]);
    }
    return bad("المسار غير موجود", 404);
  } catch (error) { console.error(error); return bad("تعذر إتمام العملية. حاول مرة أخرى.", 500); }
};

export const config: Config = { path: "/api/admin" };
