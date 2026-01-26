
import type {
  MenuItem,
  InsertMenuItem,
  MenuCategory,
  InsertMenuCategory,
  Event,
  InsertEvent,
  Reservation,
  InsertReservation,
  ReservationStatus,
} from "@shared/schema";
import { db } from "./db";
import { menuItems, menuCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Menu Categories
  getCategories(type?: 'food' | 'drink'): Promise<MenuCategory[]>;
  getCategory(id: number): Promise<MenuCategory | undefined>;
  createCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateCategory(id: number, updates: Partial<MenuCategory>): Promise<MenuCategory>;
  deleteCategory(id: number): Promise<void>;
  getItemsInCategory(categorySlug: string): Promise<MenuItem[]>;
  moveItemsToCategory(fromCategorySlug: string, toCategorySlug: string): Promise<void>;
  deleteItemsInCategory(categorySlug: string): Promise<void>;

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

class DatabaseStorage implements IStorage {
  // Menu Categories
  async getCategories(type?: 'food' | 'drink'): Promise<MenuCategory[]> {
    if (type) {
      const categories = await db.query.menuCategories.findMany({
        where: eq(menuCategories.type, type),
        orderBy: (menuCategories, { asc }) => [asc(menuCategories.displayOrder), asc(menuCategories.name)]
      });
      return categories;
    }
    
    const categories = await db.query.menuCategories.findMany({
      orderBy: (menuCategories, { asc }) => [asc(menuCategories.type), asc(menuCategories.displayOrder), asc(menuCategories.name)]
    });
    return categories;
  }

  async getCategory(id: number): Promise<MenuCategory | undefined> {
    const category = await db.query.menuCategories.findFirst({
      where: eq(menuCategories.id, id)
    });
    return category;
  }

  async createCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db.insert(menuCategories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<MenuCategory>): Promise<MenuCategory> {
    const [updatedCategory] = await db
      .update(menuCategories)
      .set(updates)
      .where(eq(menuCategories.id, id))
      .returning();
    
    if (!updatedCategory) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    // First, get the category to find its slug
    const category = await this.getCategory(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    // Check if any menu items are using this category
    const itemsUsingCategory = await db.query.menuItems.findMany({
      where: eq(menuItems.category, category.slug)
    });
    
    if (itemsUsingCategory.length > 0) {
      throw new Error(`Cannot delete category "${category.name}" because ${itemsUsingCategory.length} item(s) are using it`);
    }
    
    // Safe to delete
    await db.delete(menuCategories).where(eq(menuCategories.id, id));
  }

  async getItemsInCategory(categorySlug: string): Promise<MenuItem[]> {
    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.category, categorySlug)
    });
    return items;
  }

  async moveItemsToCategory(fromCategorySlug: string, toCategorySlug: string): Promise<void> {
    await db
      .update(menuItems)
      .set({ category: toCategorySlug })
      .where(eq(menuItems.category, fromCategorySlug));
  }

  async deleteItemsInCategory(categorySlug: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.category, categorySlug));
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.type, "food"),
      orderBy: (menuCategories, { asc }) => [asc(menuCategories.displayOrder), asc(menuCategories.name)]
    });
    const foodCategorySlugs = new Set(categories.map((category) => category.slug));

    // Get all items from database that are food items (based on category)
    const allItems = await db.query.menuItems.findMany({
      orderBy: (menuItems, { asc }) => [asc(menuItems.id)]
    });
    
    // Filter to get only food items (category in food categories)
    const foodItems = allItems.filter(item => foodCategorySlugs.has(item.category));
    
    return foodItems;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
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

      // Get all items from database
      const allItems = await db.query.menuItems.findMany();
      
      // Find the vegetarian menu items by looking up their original entries
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

    // For other categories, query directly from database
    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.category, category),
      orderBy: (menuItems, { asc }) => [asc(menuItems.id)]
    });
    
    return items;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const item = await db.query.menuItems.findFirst({
      where: eq(menuItems.id, id)
    });
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error(`Menu item with ID ${id} not found`);
    }
    
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Drinks Methods
  async getDrinks(): Promise<MenuItem[]> {
    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.type, "drink"),
      orderBy: (menuCategories, { asc }) => [asc(menuCategories.displayOrder), asc(menuCategories.name)]
    });
    const drinkCategorySlugs = new Set(categories.map((category) => category.slug));

    // Get all items from database that are drinks (based on category)
    const allItems = await db.query.menuItems.findMany({
      orderBy: (menuItems, { asc }) => [asc(menuItems.id)]
    });
    
    // Filter to get only drinks (category in drink categories)
    const drinks = allItems.filter(item => drinkCategorySlugs.has(item.category));
    
    return drinks;
  }

  async getDrinksByCategory(category: string): Promise<MenuItem[]> {
    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.category, category),
      orderBy: (menuItems, { asc }) => [asc(menuItems.id)]
    });
    
    return items;
  }

  async getDrink(id: number): Promise<MenuItem | undefined> {
    const item = await db.query.menuItems.findFirst({
      where: eq(menuItems.id, id)
    });
    return item;
  }

  async createDrink(item: InsertMenuItem): Promise<MenuItem> {
    const [newDrink] = await db.insert(menuItems).values(item).returning();
    return newDrink;
  }

  async updateDrink(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const [updatedDrink] = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    
    if (!updatedDrink) {
      throw new Error(`Drink with ID ${id} not found`);
    }
    
    return updatedDrink;
  }

  async deleteDrink(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return [];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    throw new Error("Events not implemented yet");
  }

  // Reservations
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

export const storage = new DatabaseStorage();
