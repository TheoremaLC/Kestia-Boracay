import { db } from "./db";
import { menuCategories } from "@shared/schema";

async function seedCategories() {
  console.log("Seeding categories...");
  
  const foodCategories = [
    { name: "Breakfast", slug: "breakfast", type: "food", displayOrder: 1 },
    { name: "Appetizers", slug: "appetizers", type: "food", displayOrder: 2 },
    { name: "Soups", slug: "soups", type: "food", displayOrder: 3 },
    { name: "Main Dishes", slug: "main-dishes", type: "food", displayOrder: 4 },
    { name: "Sides", slug: "sides", type: "food", displayOrder: 5 },
    { name: "Desserts", slug: "desserts", type: "food", displayOrder: 6 },
    { name: "Vegetarian", slug: "vegetarian", type: "food", displayOrder: 7 },
  ];
  
  const drinkCategories = [
    { name: "Coffee", slug: "coffee", type: "drink", displayOrder: 1 },
    { name: "Wines", slug: "wines", type: "drink", displayOrder: 2 },
    { name: "Beers", slug: "beers", type: "drink", displayOrder: 3 },
    { name: "Spirits", slug: "spirits", type: "drink", displayOrder: 4 },
    { name: "Cocktails", slug: "cocktails", type: "drink", displayOrder: 5 },
    { name: "Non-Alcoholics", slug: "non-alcoholics", type: "drink", displayOrder: 6 },
  ];
  
  const allCategories = [...foodCategories, ...drinkCategories];
  
  // Insert categories
  for (const category of allCategories) {
    try {
      await db.insert(menuCategories).values(category);
      console.log(`✓ Created category: ${category.name}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log(`- Category already exists: ${category.name}`);
      } else {
        console.error(`✗ Failed to create category ${category.name}:`, error.message);
      }
    }
  }
  
  console.log("Categories seeding completed!");
}

seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
