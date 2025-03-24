import type {
  MenuItem,
  InsertMenuItem,
  Event,
  InsertEvent,
  Reservation,
  InsertReservation,
} from "@shared/schema";

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
}

class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private reservations: Map<number, Reservation>;
  private currentIds: {
    menuItems: number;
    events: number;
    reservations: number;
  };

  constructor() {
    this.events = new Map();
    this.reservations = new Map();
    this.currentIds = {
      menuItems: 1,
      events: 1,
      reservations: 1,
    };
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    // Import JSON file dynamically to get fresh content
    const menuData = await import("../shared/menu-items.json", { assert: { type: "json" } });
    const allItems: MenuItem[] = [];
    let id = 1;

    // Get items from each category
    Object.entries(menuData.default).forEach(([category, items]) => {
      if (Array.isArray(items)) {
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
    // Import JSON file dynamically to get fresh content
    const menuData = await import("../shared/menu-items.json", { assert: { type: "json" } });
    const categoryItems = menuData.default[category];

    // If category doesn't exist or isn't an array, return empty array
    if (!Array.isArray(categoryItems)) {
      return [];
    }

    // Map items with IDs and return only items from requested category
    let id = 1;
    return categoryItems.map(item => ({
      id: id++,
      ...item,
      category
    }));
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
    const id = this.currentIds.reservations++;
    const newReservation = { id, ...reservation } as Reservation;
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  async getReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }
}

export const storage = new MemStorage();