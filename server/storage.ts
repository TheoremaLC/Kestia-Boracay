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

    // Get items from all categories except vegetarian (we'll handle vegetarian separately)
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

    return allItems;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    // Load all menu items with their global IDs
    const allItems = await this.getMenuItems();
    
    // For vegetarian category, create a specialized list
    if (category === "vegetarian") {
      // Define which breakfast items are vegetarian
      const vegetarianBreakfastItems = ["Vegetable Omelet", "Bread & Butter & Jams", "MBS"];
      
      // Define which extras are vegetarian
      const vegetarianExtrasItems = ["Yogurt", "Bread", "Onion salad"];
      
      // Define which main dishes are vegetarian
      const vegetarianMainItems = [
        "Buls Palanta", 
        "Veggie Burger", 
        "Roasted Vegetable Platter"
      ];
      
      // Define which soups are vegetarian
      const vegetarianSoupItems = ["Vegetable Cream Soup", "Pumpkin Soup"];
      
      // Define which sides are vegetarian  
      const vegetarianSideItems = [
        "Green Salad", 
        "Onion Tomato Salad", 
        "Sauteed Garlic Kangkong", 
        "Stir Fried Vegetables"
      ];
      
      // First add breakfast vegetarian items (top of the menu)
      const vegetarianItems = allItems
        .filter(item => 
          vegetarianBreakfastItems.includes(item.name) && 
          item.category === "breakfast"
        )
        .map(item => ({
          ...item,
          category: "vegetarian"
        }));
    
      // Add the EXTRAS_SECTION header 
      const extrasSection = allItems.find(item => 
        item.name === "EXTRAS_SECTION" && 
        item.category === "breakfast"
      );
      
      if (extrasSection) {
        vegetarianItems.push({
          ...extrasSection,
          category: "vegetarian"
        });
      }
      
      // Add vegetarian extras
      const vegetarianExtras = allItems
        .filter(item => 
          vegetarianExtrasItems.includes(item.name) && 
          item.category === "breakfast"
        )
        .map(item => ({
          ...item,
          category: "vegetarian"
        }));
      
      vegetarianItems.push(...vegetarianExtras);
      
      // Add vegetarian soups
      const vegetarianSoups = allItems
        .filter(item => 
          vegetarianSoupItems.includes(item.name) && 
          item.category === "soups"
        )
        .map(item => ({
          ...item,
          category: "vegetarian"
        }));
        
      vegetarianItems.push(...vegetarianSoups);
      
      // Add vegetarian main dishes
      const vegetarianMains = allItems
        .filter(item => 
          vegetarianMainItems.includes(item.name) && 
          item.category === "main-dishes"
        )
        .map(item => ({
          ...item,
          category: "vegetarian"
        }));
        
      vegetarianItems.push(...vegetarianMains);
      
      // Add vegetarian sides
      const vegetarianSides = allItems
        .filter(item => 
          vegetarianSideItems.includes(item.name) && 
          item.category === "sides"
        )
        .map(item => ({
          ...item,
          category: "vegetarian"
        }));
        
      vegetarianItems.push(...vegetarianSides);
      
      // Sort by ID to maintain consistent ordering
      return vegetarianItems.sort((a, b) => a.id - b.id);
    }
    
    // For other categories, get items from the complete menu
    return allItems.filter(item => item.category === category);
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