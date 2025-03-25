import type {
  MenuItem,
  InsertMenuItem,
  Event,
  InsertEvent,
  Reservation,
  InsertReservation,
  ReservationStatus,
} from "@shared/schema";
import postgres from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { menuItems, events, reservations } from "@shared/schema";

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Reservations 
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getReservations(): Promise<Reservation[]>;
  updateReservationStatus(id: number, status: ReservationStatus): Promise<Reservation>;
}

const pool = new postgres.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

class DbStorage implements IStorage {
  private events: Map<number, Event>;
  private currentIds: {
    menuItems: number;
    events: number;
  };

  constructor() {
    this.events = new Map();
    this.currentIds = {
      menuItems: 1,
      events: 1,
    };
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    // Import JSON file dynamically to get fresh content
    const menuData = await import("../shared/menu-items.json", { assert: { type: "json" } });
    const allItems: MenuItem[] = [];
    let id = 1;

    // Get items from all categories except vegetarian (we'll handle vegetarian specially)
    Object.entries(menuData.default).forEach(([category, items]) => {
      if (Array.isArray(items) && category !== "vegetarian") {
        items.forEach((item: any) => {
          allItems.push({
            id: id++,
            ...item,
            category
          });
        });
      }
    });

    // We don't add vegetarian items separately as they are duplicates of items in other categories
    // Instead, they are handled specially in getMenuItemsByCategory

    return allItems;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    if (category === "vegetarian") {
      // For vegetarian, we need to load directly from the JSON file to get the complete vegetarian menu
      const menuData = await import("../shared/menu-items.json", { assert: { type: "json" } });
      const allItems: MenuItem[] = [];
      let id = 1;
      
      // First add all non-vegetarian items to track correct global IDs
      Object.entries(menuData.default).forEach(([cat, items]) => {
        if (Array.isArray(items) && cat !== "vegetarian") {
          items.forEach(() => {
            id++; // Just increment to keep track of global IDs
          });
        }
      });
      
      // Now add the vegetarian items with their correct global IDs
      // We need to identify which items from other categories are in the vegetarian section
      if (Array.isArray(menuData.default.vegetarian)) {
        menuData.default.vegetarian.forEach((item: any) => {
          // For each vegetarian item, find its corresponding item in its original category to get the correct ID
          let originalItem: any = null;
          let originalId = -1;
          
          if (item.originalCategory) {
            const originalCategoryItems = menuData.default[item.originalCategory];
            if (Array.isArray(originalCategoryItems)) {
              originalId = originalCategoryItems.findIndex((origItem: any) => origItem.name === item.name);
              if (originalId !== -1) {
                // Calculate the global ID for this item based on its position in the original category
                let globalId = 1;
                Object.entries(menuData.default).forEach(([cat, catItems]) => {
                  if (cat === item.originalCategory) {
                    globalId += originalId;
                    return;
                  } else if (cat !== "vegetarian" && Array.isArray(catItems)) {
                    globalId += catItems.length;
                  }
                });
                
                allItems.push({
                  id: globalId,
                  ...item,
                  category: "vegetarian"
                });
              }
            }
          }
          
          // If we couldn't find the original item (for items that are exclusively in vegetarian section)
          if (originalId === -1) {
            allItems.push({
              id: id++,
              ...item,
              category: "vegetarian"
            });
          }
        });
      }
      
      return allItems;
    }
    
    // For other categories, get the global IDs by filtering from all menu items
    const allMenuItems = await this.getMenuItems();
    return allMenuItems.filter(item => item.category === category);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const allItems = await this.getMenuItems();
    return allItems.find(item => item.id === id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentIds.menuItems++;
    return { id, ...item } as MenuItem;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentIds.events++;
    const newEvent = { id, ...event } as Event;
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Reservations
  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    // Convert the date string to a Date object as expected by the schema
    const formattedReservation = {
      ...reservation,
      date: new Date(reservation.date)
    };
    
    const result = await db.insert(reservations)
      .values(formattedReservation)
      .returning();
    return result[0];
  }

  async getReservations(): Promise<Reservation[]> {
    return db.select().from(reservations);
  }

  async updateReservationStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    const result = await db.update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();

    if (!result[0]) {
      throw new Error(`Reservation with ID ${id} not found`);
    }

    return result[0];
  }
}

export const storage = new DbStorage();