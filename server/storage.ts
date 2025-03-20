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
        name: "English Breakfast",
        description: "Complete breakfast with eggs, bacon, sausage, beans, and toast",
        price: 45900,
        category: "breakfast",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Vegetable Omelet",
        description: "Fresh vegetables folded into fluffy eggs",
        price: 29900,
        category: "breakfast",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Tapsilog",
        description: "Filipino breakfast with marinated beef, garlic rice, and fried egg",
        price: 32900,
        category: "breakfast",
        imageUrl: null,
        isSpecial: false
      },
      // Extras
      {
        name: "Bacon",
        description: "Crispy bacon strips",
        price: 15900,
        category: "extras",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Two Eggs any Style",
        description: "Eggs cooked to your preference",
        price: 12900,
        category: "extras",
        imageUrl: null,
        isSpecial: false
      },
      // Soups
      {
        name: "Goulash",
        description: "Hungarian-style beef and vegetable soup",
        price: 35900,
        category: "soup",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Vegetable Cream Soup",
        description: "Smooth and creamy vegetable soup",
        price: 29900,
        category: "soup",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Bulalo Soup",
        description: "Filipino beef marrow soup with vegetables",
        price: 39900,
        category: "soup",
        imageUrl: null,
        isSpecial: false
      },
      // Appetizers
      {
        name: "Quiche Lorraine",
        description: "Classic French tart with bacon and cheese",
        price: 32900,
        category: "appetizers",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Mici Platter",
        description: "Romanian grilled meat rolls served with mustard",
        price: 35900,
        category: "appetizers",
        imageUrl: null,
        isSpecial: false
      },
      // Salads
      {
        name: "Green Salad",
        description: "Fresh mixed greens with house dressing",
        price: 25900,
        category: "salads",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Onion Tomato Salad",
        description: "Simple and refreshing salad with onions and tomatoes",
        price: 22900,
        category: "salads",
        imageUrl: null,
        isSpecial: false
      },
      // Vegetables
      {
        name: "Garlic Kangkong",
        description: "Sautéed water spinach with garlic",
        price: 25900,
        category: "vegetables",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Stir Fried Veggies",
        description: "Assorted vegetables stir-fried to perfection",
        price: 28900,
        category: "vegetables",
        imageUrl: null,
        isSpecial: false
      },
      // Pickles
      {
        name: "Pickled Cabbage",
        description: "Traditional pickled cabbage",
        price: 15900,
        category: "pickles",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Pickled Cucumber",
        description: "Crisp pickled cucumbers",
        price: 15900,
        category: "pickles",
        imageUrl: null,
        isSpecial: false
      },
      // Burgers
      {
        name: "Kestía Cheeseburger",
        description: "Signature cheeseburger with all the fixings",
        price: 35900,
        category: "burgers",
        imageUrl: null,
        isSpecial: false
      },
      // Main Course
      {
        name: "Sarmale",
        description: "Romanian stuffed cabbage rolls",
        price: 45900,
        category: "main-course",
        imageUrl: null,
        isSpecial: true
      },
      {
        name: "Beef Salpicao",
        description: "Garlic-butter beef cubes with mushrooms",
        price: 52900,
        category: "main-course",
        imageUrl: null,
        isSpecial: false
      },
      // Grilled
      {
        name: "Grilled Pork Steak",
        description: "Served with fries and cabbage salad",
        price: 45900,
        category: "grilled",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Grilled Chicken Breast",
        description: "Served with fries and cabbage salad",
        price: 42900,
        category: "grilled",
        imageUrl: null,
        isSpecial: false
      },
      // Fish
      {
        name: "Grilled Dory",
        description: "Grilled dory fillet with Kestia rice and boiled potatoes",
        price: 42900,
        category: "fish",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Fried Fish with Polenta",
        description: "Crispy fried fish served with traditional polenta",
        price: 39900,
        category: "fish",
        imageUrl: null,
        isSpecial: false
      },
      // Pasta
      {
        name: "Seafood Pasta",
        description: "Mixed seafood in tomato or cream sauce",
        price: 48900,
        category: "pasta",
        imageUrl: null,
        isSpecial: true
      },
      {
        name: "Carbonara",
        description: "Creamy pasta with bacon and egg",
        price: 38900,
        category: "pasta",
        imageUrl: null,
        isSpecial: false
      },
      // Desserts
      {
        name: "Mango Float",
        description: "Filipino dessert with layers of graham crackers, cream, and fresh mangoes",
        price: 25900,
        category: "desserts",
        imageUrl: null,
        isSpecial: false
      },
      {
        name: "Cheese Cake",
        description: "Classic creamy cheesecake",
        price: 28900,
        category: "desserts",
        imageUrl: null,
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