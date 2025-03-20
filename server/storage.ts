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

    // Add all menu items
    const menuItems: InsertMenuItem[] = [
      // Breakfast
      {
        name: "Vegetable Omelet",
        description: "Fresh vegetables folded into fluffy eggs",
        price: 29900,
        category: "breakfast",
        imageUrl: "https://source.unsplash.com/featured/?omelet",
        isSpecial: false
      },
      {
        name: "Tapsilog",
        description: "Filipino breakfast with marinated beef, garlic rice, and fried egg",
        price: 32900,
        category: "breakfast",
        imageUrl: "https://source.unsplash.com/featured/?filipino,breakfast",
        isSpecial: false
      },
      {
        name: "English Breakfast",
        description: "Complete breakfast with eggs, bacon, sausage, beans, and toast",
        price: 45900,
        category: "breakfast",
        imageUrl: "https://source.unsplash.com/featured/?english,breakfast",
        isSpecial: false
      },
      // Soups
      {
        name: "Goulash",
        description: "Hungarian-style beef and vegetable soup",
        price: 35900,
        category: "soup",
        imageUrl: "https://source.unsplash.com/featured/?goulash",
        isSpecial: false
      },
      {
        name: "Bulalo Soup",
        description: "Filipino beef marrow soup with vegetables",
        price: 39900,
        category: "soup",
        imageUrl: "https://source.unsplash.com/featured/?soup",
        isSpecial: false
      },
      // Appetizers
      {
        name: "Quiche Lorraine",
        description: "Classic French tart with bacon and cheese",
        price: 32900,
        category: "appetizers",
        imageUrl: "https://source.unsplash.com/featured/?quiche",
        isSpecial: false
      },
      {
        name: "3 in 1 Appetizer",
        description: "Mici, Eggplant salad, and Liver pate",
        price: 42900,
        category: "appetizers",
        imageUrl: "https://source.unsplash.com/featured/?appetizer",
        isSpecial: true
      },
      // Main Course
      {
        name: "Sarmale",
        description: "Romanian stuffed cabbage rolls",
        price: 45900,
        category: "main-course",
        imageUrl: "https://source.unsplash.com/featured/?cabbage,rolls",
        isSpecial: true
      },
      {
        name: "Beef Salpicao",
        description: "Garlic-butter beef cubes with mushrooms",
        price: 52900,
        category: "main-course",
        imageUrl: "https://source.unsplash.com/featured/?beef",
        isSpecial: false
      },
      // Pasta
      {
        name: "Creamy Four Cheese Pasta",
        description: "Rich pasta with four different cheeses and mushrooms",
        price: 42900,
        category: "pasta",
        imageUrl: "https://source.unsplash.com/featured/?pasta,cheese",
        isSpecial: false
      },
      {
        name: "Seafood Pasta",
        description: "Mixed seafood in tomato or cream sauce",
        price: 48900,
        category: "pasta",
        imageUrl: "https://source.unsplash.com/featured/?seafood,pasta",
        isSpecial: true
      },
      // Grilled
      {
        name: "Mici with Fries",
        description: "Romanian grilled meat rolls with fries and cabbage salad",
        price: 38900,
        category: "grilled",
        imageUrl: "https://source.unsplash.com/featured/?grilled,meat",
        isSpecial: false
      },
      // Fish
      {
        name: "Grilled Dory",
        description: "Grilled dory fillet with Kestia rice and boiled potatoes",
        price: 42900,
        category: "fish",
        imageUrl: "https://source.unsplash.com/featured/?grilled,fish",
        isSpecial: false
      },
      // Desserts
      {
        name: "Mango Float",
        description: "Filipino dessert with layers of graham crackers, cream, and fresh mangoes",
        price: 25900,
        category: "desserts",
        imageUrl: "https://source.unsplash.com/featured/?mango,dessert",
        isSpecial: false
      }
    ];

    menuItems.forEach(item => this.createMenuItem(item));
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