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

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private events: Map<number, Event>;
  private reservations: Map<number, Reservation>;
  private currentIds: { menuItems: number; events: number; reservations: number };

  constructor() {
    this.menuItems = new Map();
    this.events = new Map();
    this.reservations = new Map();
    this.currentIds = { menuItems: 1, events: 1, reservations: 1 };
    
    // Add some sample menu items
    const sampleItems: InsertMenuItem[] = [
      {
        name: "Crispy Calamari",
        description: "Tender calamari rings lightly breaded and fried to a golden crisp, served with marinara sauce and lemon wedges",
        price: 1299,
        category: "appetizers",
        imageUrl: "https://source.unsplash.com/featured/?calamari",
        isSpecial: false
      },
      {
        name: "Caprese Bruschetta",
        description: "Slices of toasted baguette topped with fresh mozzarella, cherry tomatoes, basil, and balsamic glaze",
        price: 1099,
        category: "appetizers",
        imageUrl: "https://source.unsplash.com/featured/?bruschetta",
        isSpecial: false
      }
    ];
    
    sampleItems.forEach(item => this.createMenuItem(item));
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
    const menuItem = { ...item, id };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentIds.events++;
    const newEvent = { ...event, id };
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Reservations
  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const id = this.currentIds.reservations++;
    const newReservation = { ...reservation, id };
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  async getReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }
}

export const storage = new MemStorage();
