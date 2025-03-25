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
      // Create a direct mapping to ensure we use the exact same IDs from the general menu
      // This is the key to ensuring consistent ID numbering
      const vegetarianMenu: {[key: string]: string[]} = {
        "breakfast": ["Vegetable Omelet", "Bread & Butter & Jams", "MBS"],
        "soups": ["Vegetable Cream Soup", "Romanian Bean Soup"],
        "sides": [
          "Green Salad", 
          "Onion Tomato Salad", 
          "Sauteed Garlic Kangkong", 
          "Stir Fried Vegetables",
          "Pickled Cabbage",
          "Pickled Tomato",
          "Pickled Cucumber"
        ],
        "main-dishes": ["Buls Palanta"],
        "extras": ["Yogurt", "Bread", "Onion salad", "Kestia rice", "Two Eggs any Style"]
      };
      
      // Find the vegetarian menu items by looking up their original entries in the main menu
      let vegetarianItems: MenuItem[] = [];
      
      // Process regular vegetarian items
      Object.entries(vegetarianMenu).forEach(([sourceCategory, itemNames]) => {
        if (sourceCategory !== "extras") {
          itemNames.forEach(name => {
            // Find the original item with its ID from the main menu
            const originalItem = allItems.find(item => 
              item.name === name && item.category === sourceCategory
            );
            
            if (originalItem) {
              // Create a copy with the same ID but mark as vegetarian category
              vegetarianItems.push({
                ...originalItem,
                category: "vegetarian"
              });
            }
          });
        }
      });
      
      // Add the EXTRAS section
      const extrasSection = allItems.find(item => 
        item.name === "EXTRAS_SECTION" && item.category === "breakfast"
      );
      
      if (extrasSection) {
        vegetarianItems.push({
          ...extrasSection,
          category: "vegetarian"
        });
        
        // Add the extras with their original IDs
        vegetarianMenu.extras.forEach(name => {
          // For extras, we need to find them in the breakfast category
          const originalItem = allItems.find(item => 
            item.name === name && item.category === "breakfast"
          );
          
          if (originalItem) {
            vegetarianItems.push({
              ...originalItem,
              category: "vegetarian"
            });
          }
        });
      }
      
      return vegetarianItems;
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