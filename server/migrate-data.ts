import { db } from "./db";
import { menuItems } from "@shared/schema";
import { promises as fs } from 'fs';
import path from 'path';

async function migrateData() {
  console.log("Starting data migration...");
  
  // Read JSON files
  const menuItemsPath = path.join(process.cwd(), 'shared/menu-items.json');
  const drinksPath = path.join(process.cwd(), 'shared/drinks.json');
  
  const menuData = JSON.parse(await fs.readFile(menuItemsPath, 'utf-8'));
  const drinksData = JSON.parse(await fs.readFile(drinksPath, 'utf-8'));
  
  // Prepare all menu items
  const allItems = [];
  let foodId = 1;
  
  // Process food items (excluding vegetarian as it's a derived view)
  for (const [category, items] of Object.entries(menuData)) {
    if (category === "vegetarian" || !Array.isArray(items)) continue;
    
    for (const item of items as any[]) {
      allItems.push({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: category,
        imageUrl: item.imageUrl || null,
        isSpecial: item.isSpecial || false
      });
      foodId++;
    }
  }
  
  console.log(`Found ${allItems.length} food items`);
  
  // Process drinks starting at ID 1000
  let drinkId = 1000;
  for (const [category, items] of Object.entries(drinksData)) {
    if (!Array.isArray(items)) continue;
    
    for (const item of items as any[]) {
      allItems.push({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: category,
        imageUrl: item.imageUrl || null,
        isSpecial: item.isSpecial || false
      });
      drinkId++;
    }
  }
  
  console.log(`Found ${drinkId - 1000} drink items`);
  console.log(`Total items to migrate: ${allItems.length}`);
  
  // Insert all items into database
  if (allItems.length > 0) {
    // Clear existing data first
    await db.delete(menuItems);
    console.log("Cleared existing menu items");
    
    // Insert new data in batches
    const batchSize = 50;
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, i + batchSize);
      await db.insert(menuItems).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allItems.length / batchSize)}`);
    }
  }
  
  console.log("Data migration completed successfully!");
  console.log(`Total items migrated: ${allItems.length}`);
}

migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
