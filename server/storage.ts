import type {
  MenuItem,
  InsertMenuItem,
  Event,
  InsertEvent,
  Reservation,
  InsertReservation,
} from "@shared/schema";
import menuItems from "../shared/menu-items.json" assert { type: "json" };

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
  private menuItems: Map<number, MenuItem>;
  private events: Map<number, Event>;
  private reservations: Map<number, Reservation>;
  private currentIds: {
    menuItems: number;
    events: number;
    reservations: number;
  };

  constructor() {
    this.menuItems = new Map();
    this.events = new Map();
    this.reservations = new Map();
    this.currentIds = {
      menuItems: 1,
      events: 1,
      reservations: 1,
    };

    // Initialize menu items from categorized JSON
    Object.entries(menuItems).forEach(([category, items]) => {
      (items as InsertMenuItem[]).forEach(item => {
        const menuItem: InsertMenuItem = {
          name: item.name,
          description: item.description,
          price: item.price,
          category: category,
          imageUrl: item.imageUrl,
          isSpecial: item.isSpecial
        };
        this.createMenuItem(menuItem);
      });
    });
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.category === category
    );
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentIds.menuItems++;
    const menuItem = { id, ...item } as MenuItem;
    this.menuItems.set(id, menuItem);
    return menuItem;
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