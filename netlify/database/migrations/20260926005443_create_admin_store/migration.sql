CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"phone" text NOT NULL UNIQUE,
	"address" text DEFAULT '' NOT NULL,
	"order_count" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(12,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"customer_id" integer,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"products" jsonb NOT NULL,
	"total" numeric(12,2) NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"old_price" numeric(10,2),
	"discount" integer DEFAULT 0 NOT NULL,
	"images" jsonb DEFAULT '[]' NOT NULL,
	"category_id" integer,
	"in_stock" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" serial PRIMARY KEY,
	"store_name" text DEFAULT 'LMPharma' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"delivery_fee" numeric(10,2) DEFAULT '0' NOT NULL,
	"free_delivery_threshold" numeric(10,2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;