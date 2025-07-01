CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"is_special" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"date" timestamp NOT NULL,
	"time" text NOT NULL,
	"guests" integer NOT NULL,
	"seating_preference" text DEFAULT 'table' NOT NULL,
	"table_id" integer,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_number" integer NOT NULL,
	"capacity" integer DEFAULT 4 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;