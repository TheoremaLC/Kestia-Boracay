
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { offers, type InsertOffer, type Offer } from "@shared/schema";

const defaultOffers: InsertOffer[] = [
  { name: "SMB", price: 7000, isActive: true },
  { name: "SML", price: 8000, isActive: true },
  { name: "Red Horse", price: 8000, isActive: true },
  { name: "Rum Coke", price: 10000, isActive: true },
];

let initialized = false;
async function ensureOffersTableAndSeed(): Promise<void> {
  if (initialized) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "offers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "price" integer NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL
    );
  `);

  const [existing] = await db.select({ count: sql<number>`count(*)::int` }).from(offers);
  if ((existing?.count ?? 0) === 0) {
    await db.insert(offers).values(defaultOffers);
  }

  initialized = true;
}

export const offersStorage = {
  async getOffers(): Promise<Offer[]> {
    await ensureOffersTableAndSeed();
    return db.query.offers.findMany({
      orderBy: (offers, { asc }) => [asc(offers.id)],
    });
  },

  async createOffer(item: InsertOffer): Promise<Offer> {
    await ensureOffersTableAndSeed();
    const [newOffer] = await db.insert(offers).values(item).returning();
    return newOffer;
  },

  async updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer> {
    await ensureOffersTableAndSeed();
    const [updatedOffer] = await db
      .update(offers)
      .set(updates)
      .where(eq(offers.id, id))
      .returning();

    if (!updatedOffer) {
      throw new Error(`Offer with id ${id} not found`);
    }

    return updatedOffer;
  },

  async deleteOffer(id: number): Promise<void> {
    await ensureOffersTableAndSeed();
    await db.delete(offers).where(eq(offers.id, id));
  },

  async getActiveOffers(): Promise<Offer[]> {
    await ensureOffersTableAndSeed();
    return db.query.offers.findMany({
      where: eq(offers.isActive, true),
      orderBy: (offers, { asc }) => [asc(offers.id)],
    });
  },
};
