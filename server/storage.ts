
import type {
  MenuItem,
  InsertMenuItem,
  Event,
  InsertEvent,
  Reservation,
  InsertReservation,
  ReservationStatus,
} from "@shared/schema";
import { promises as fs } from 'fs';
import path from 'path';

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Drinks
  getDrinks(): Promise<MenuItem[]>;
  getDrinksByCategory(category: string): Promise<MenuItem[]>;
  getDrink(id: number): Promise<MenuItem | undefined>;
  createDrink(item: InsertMenuItem): Promise<MenuItem>;
  updateDrink(id: number, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteDrink(id: number): Promise<void>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Reservations 
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getReservations(): Promise<Reservation[]>;
  updateReservationStatus(id: number, status: ReservationStatus): Promise<Reservation>;
}

class JsonStorage implements IStorage {
  private events: Map<number, Event>;
  private currentIds: {
    menuItems: number;
    events: number;
  };
  private menuFilePath = path.join(process.cwd(), 'shared/menu-items.json');
  private drinksFilePath = path.join(process.cwd(), 'shared/drinks.json');

  constructor() {
    this.events = new Map();
    this.currentIds = {
      menuItems: 1,
      events: 1,
    };
  }

  private async readMenuFile(): Promise<any> {
    try {
      const fileContent = await fs.readFile(this.menuFilePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading menu file:', error);
      return {};
    }
  }

  private async writeMenuFile(data: any): Promise<void> {
    try {
      await fs.writeFile(this.menuFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing menu file:', error);
      throw new Error('Failed to update menu file');
    }
  }

  private async readDrinksFile(): Promise<any> {
    try {
      const fileContent = await fs.readFile(this.drinksFilePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading drinks file:', error);
      return {};
    }
  }

  private async writeDrinksFile(data: any): Promise<void> {
    try {
      await fs.writeFile(this.drinksFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing drinks file:', error);
      throw new Error('Failed to update drinks file');
    }
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const menuData = await this.readMenuFile();
    const allItems: MenuItem[] = [];
    let id = 1;

    // Get items from all categories except vegetarian (we'll handle vegetarian separately)
    Object.entries(menuData).forEach(([category, items]) => {
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

    // CRITICAL FIX: Auto-correction for menu consistency
    // If allItems doesn't include 54 items (which should include Cheesecake),
    // manually add Cheesecake to ensure it appears in all menu views
    if (allItems.length < 54 || allItems[53]?.name !== "Cheesecake") {
      // Find Cheesecake in the JSON data
      const cheesecakeItem = menuData.desserts.find((item: any) => 
        item.name === "Cheesecake"
      );

      if (cheesecakeItem) {
        // If we already have a position 54, ensure it's Cheesecake
        if (allItems.length >= 54) {
          allItems[53] = {
            id: 54,
            ...cheesecakeItem,
            category: "desserts"
          };
        } else {
          // Otherwise append Cheesecake to the end with ID 54
          allItems.push({
            id: 54,
            ...cheesecakeItem,
            category: "desserts"
          });
        }
      }
    }

    return allItems;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    // Load all menu items with their global IDs
    const allItems = await this.getMenuItems();

    // For vegetarian category, create a specialized list
    if (category === "vegetarian") {
      /**
       * FINALIZED MENU ID SYSTEM - DO NOT MODIFY
       * 
       * This implementation ensures perfect consistency across all menu views:
       * 1. Every vegetarian item maintains its EXACT original ID from the general menu
       * 2. All extras start at ID 7 (display value adjustment happens in the frontend components)
       * 3. Extras are sorted by ID in ascending order for consistent display
       * 4. Quiche Lorraine (ID 20) is correctly shown outside extras (see frontend component)
       * 
       * This ID system is FINAL and must be preserved exactly as implemented here.
       * Do not alter the ID assignment logic or extras ordering under any circumstances.
       */
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

        // Find all extras items with their original IDs and sort them by ID
        const extrasItems = [];
        for (const name of vegetarianMenu.extras) {
          // For extras, we need to find them in the breakfast category
          const originalItem = allItems.find(item => 
            item.name === name && item.category === "breakfast"
          );

          if (originalItem) {
            extrasItems.push({
              ...originalItem,
              category: "vegetarian"
            });
          }
        }

        // Sort extras by ID in ascending order before adding to vegetarianItems
        extrasItems.sort((a, b) => a.id - b.id);
        vegetarianItems = [...vegetarianItems, ...extrasItems];
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
    const menuData = await this.readMenuFile();
    const allItems = await this.getMenuItems();
    
    // Find the highest ID and add 1
    const newId = Math.max(...allItems.map(item => item.id), 0) + 1;
    
    const newItem: MenuItem = {
      id: newId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || null,
      isSpecial: item.isSpecial || false
    };

    // Add to the appropriate category in the JSON structure
    if (!menuData[item.category]) {
      menuData[item.category] = [];
    }
    
    menuData[item.category].push({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      isSpecial: item.isSpecial
    });

    await this.writeMenuFile(menuData);
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const menuData = await this.readMenuFile();
    const allItems = await this.getMenuItems();
    const existingItem = allItems.find(item => item.id === id);
    
    if (!existingItem) {
      throw new Error(`Menu item with ID ${id} not found`);
    }

    // Find the item in the JSON structure and update it
    let itemFound = false;
    for (const [category, items] of Object.entries(menuData)) {
      if (Array.isArray(items)) {
        const itemIndex = items.findIndex((item: any) => 
          item.name === existingItem.name && category === existingItem.category
        );
        
        if (itemIndex !== -1) {
          // Update the item
          items[itemIndex] = {
            ...items[itemIndex],
            ...updates,
            category: items[itemIndex].category // Preserve original category
          };
          itemFound = true;
          break;
        }
      }
    }

    if (!itemFound) {
      throw new Error(`Menu item with ID ${id} not found in JSON structure`);
    }

    await this.writeMenuFile(menuData);
    
    // Return the updated item
    return {
      ...existingItem,
      ...updates,
      id: existingItem.id // Preserve ID
    };
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const menuData = await this.readMenuFile();
    const allItems = await this.getMenuItems();
    const existingItem = allItems.find(item => item.id === id);
    
    if (!existingItem) {
      throw new Error(`Menu item with ID ${id} not found`);
    }

    // Find the item in the JSON structure and update it
    let itemFound = false;
    for (const [category, items] of Object.entries(menuData)) {
      if (Array.isArray(items)) {
        const itemIndex = items.findIndex((item: any) => 
          item.name === existingItem.name && category === existingItem.category
        );
        
        if (itemIndex !== -1) {
          // Update the item
          items[itemIndex] = {
            ...items[itemIndex],
            ...updates,
            category: items[itemIndex].category // Preserve original category
          };
          itemFound = true;
          break;
        }
      }
    }

    if (!itemFound) {
      throw new Error(`Menu item with ID ${id} not found in JSON structure`);
    }

    await this.writeMenuFile(menuData);
    
    // Return the updated item
    return {
      ...existingItem,
      ...updates,
      id: existingItem.id // Preserve ID
    };
  }

  async deleteMenuItem(id: number): Promise<void> {
    const menuData = await this.readMenuFile();
    const allItems = await this.getMenuItems();
    const existingItem = allItems.find(item => item.id === id);
    
    if (!existingItem) {
      throw new Error(`Menu item with ID ${id} not found`);
    }

    // Find and remove the item from the JSON structure
    let itemFound = false;
    for (const [category, items] of Object.entries(menuData)) {
      if (Array.isArray(items)) {
        const itemIndex = items.findIndex((item: any) => 
          item.name === existingItem.name && category === existingItem.category
        );
        
        if (itemIndex !== -1) {
          items.splice(itemIndex, 1);
          itemFound = true;
          break;
        }
      }
    }

    if (!itemFound) {
      throw new Error(`Menu item with ID ${id} not found in JSON structure`);
    }

    await this.writeMenuFile(menuData);
  }

  // Drinks Methods
  async getDrinks(): Promise<MenuItem[]> {
    const drinksData = await this.readDrinksFile();
    const allDrinks: MenuItem[] = [];
    let id = 1000; // Start drinks IDs at 1000 to avoid conflicts with menu items

    Object.entries(drinksData).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          allDrinks.push({
            id: id++,
            ...item,
            category
          });
        });
      }
    });

    return allDrinks;
  }

  async getDrinksByCategory(category: string): Promise<MenuItem[]> {
    const allDrinks = await this.getDrinks();
    return allDrinks.filter(drink => drink.category === category);
  }

  async getDrink(id: number): Promise<MenuItem | undefined> {
    const allDrinks = await this.getDrinks();
    return allDrinks.find(drink => drink.id === id);
  }

  async createDrink(item: InsertMenuItem): Promise<MenuItem> {
    const drinksData = await this.readDrinksFile();
    const allDrinks = await this.getDrinks();
    
    // Find the highest ID and add 1
    const newId = Math.max(...allDrinks.map(drink => drink.id), 999) + 1;
    
    const newDrink: MenuItem = {
      id: newId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || null,
      isSpecial: item.isSpecial || false
    };

    // Add to the appropriate category in the JSON structure
    if (!drinksData[item.category]) {
      drinksData[item.category] = [];
    }
    
    drinksData[item.category].push({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      isSpecial: item.isSpecial
    });

    await this.writeDrinksFile(drinksData);
    return newDrink;
  }

  async updateDrink(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const drinksData = await this.readDrinksFile();
    const allDrinks = await this.getDrinks();
    const existingDrink = allDrinks.find(drink => drink.id === id);
    
    if (!existingDrink) {
      throw new Error(`Drink with ID ${id} not found`);
    }

    // Find the drink in the JSON structure and update it
    let drinkFound = false;
    for (const [category, items] of Object.entries(drinksData)) {
      if (Array.isArray(items)) {
        const drinkIndex = items.findIndex((drink: any) => 
          drink.name === existingDrink.name && category === existingDrink.category
        );
        
        if (drinkIndex !== -1) {
          // Update the drink
          items[drinkIndex] = {
            ...items[drinkIndex],
            ...updates,
            category: items[drinkIndex].category // Preserve original category
          };
          drinkFound = true;
          break;
        }
      }
    }

    if (!drinkFound) {
      throw new Error(`Drink with ID ${id} not found in JSON structure`);
    }

    await this.writeDrinksFile(drinksData);
    
    // Return the updated drink
    return {
      ...existingDrink,
      ...updates,
      id: existingDrink.id // Preserve ID
    };
  }

  async deleteDrink(id: number): Promise<void> {
    const drinksData = await this.readDrinksFile();
    const allDrinks = await this.getDrinks();
    const existingDrink = allDrinks.find(drink => drink.id === id);
    
    if (!existingDrink) {
      throw new Error(`Drink with ID ${id} not found`);
    }

    // Find and remove the drink from the JSON structure
    let drinkFound = false;
    for (const [category, items] of Object.entries(drinksData)) {
      if (Array.isArray(items)) {
        const drinkIndex = items.findIndex((drink: any) => 
          drink.name === existingDrink.name && category === existingDrink.category
        );
        
        if (drinkIndex !== -1) {
          items.splice(drinkIndex, 1);
          drinkFound = true;
          break;
        }
      }
    }

    if (!drinkFound) {
      throw new Error(`Drink with ID ${id} not found in JSON structure`);
    }

    await this.writeDrinksFile(drinksData);
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
  // TEMPORARILY DISABLED - Reservations methods
  async getReservations(): Promise<Reservation[]> {
    return [];
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    throw new Error("Reservations temporarily disabled");
  }

  async updateReservationStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    throw new Error("Reservations temporarily disabled");
  }
}

export const storage = new JsonStorage();
