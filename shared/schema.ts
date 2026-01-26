import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * CRITICAL REQUIREMENT - DO NOT MODIFY MENU ID NUMBERING SYSTEM
 * 
 * The ID system for menu items is finalized and must NEVER be changed:
 * 
 * 1. Every menu item maintains its EXACT original ID across ALL menu views (general, vegetarian, etc.)
 * 2. Extras items start at ID 7 (not 8) in ALL menus - this is achieved by displaying ID-1 for extras items
 * 3. Quiche Lorraine Tart (ID 20) must always display outside of extras section
 * 4. Vegetarian menu items maintain identical IDs to their counterparts in the main menu
 * 5. All extras sections must display items in ascending ID order
 * 
 * This configuration is FINAL and preserved for global consistency.
 * Any future changes must preserve this numbering system to maintain menu integrity.
 */

export const categories = [
  "breakfast",
  "appetizers",
  "soups",
  "main-dishes",
  "sides",
  "desserts",
  "vegetarian"
] as const;

export const drinkCategories = [
  "coffee",
  "wines", 
  "beers",
  "spirits",
  "cocktails",
  "non-alcoholics"
] as const;

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // 'food' or 'drink'
  displayOrder: integer("display_order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isSpecial: boolean("is_special").default(false),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  capacity: integer("capacity").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
});

export const reservationStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  seatingPreference: text("seating_preference").notNull().default("table"),
  tableId: integer("table_id").references(() => tables.id),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vegetarianMenuItems = pgTable("vegetarian_menu_items", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  section: text("section").notNull().default("regular"), // "regular" | "extras"
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true });
export const seatingOptions = ["table", "bar"] as const;

export const insertReservationSchema = createInsertSchema(reservations)
  .omit({ id: true, status: true, createdAt: true, tableId: true })
  .extend({
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    guests: z.number().min(1, "Must have at least 1 guest").max(20, "Maximum 20 guests per reservation"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(7, "Phone number is too short").max(15, "Phone number is too long").optional(),
    seatingPreference: z.enum(seatingOptions, {
      errorMap: () => ({ message: "Please select a seating preference" }),
    }),
  });

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type ReservationStatus = typeof reservationStatuses[number];
export type SeatingPreference = typeof seatingOptions[number];
