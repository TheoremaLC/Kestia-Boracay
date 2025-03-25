import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = [
  "breakfast",
  "appetizers",
  "soups",
  "main-dishes",
  "sides",
  "desserts"
] as const;

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

export const reservationStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(), 
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertReservationSchema = createInsertSchema(reservations)
  .omit({ id: true, status: true, createdAt: true })
  .extend({
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    guests: z.number().min(1, "Must have at least 1 guest").max(20, "Maximum 20 guests per reservation"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(7, "Phone number is too short").max(15, "Phone number is too long"),
  });

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type ReservationStatus = typeof reservationStatuses[number];