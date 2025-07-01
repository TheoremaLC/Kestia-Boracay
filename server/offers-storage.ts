
import fs from 'fs/promises';
import path from 'path';

interface OfferItem {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

interface InsertOfferItem {
  name: string;
  price: number;
  isActive: boolean;
}

const OFFERS_FILE = path.join(process.cwd(), 'offers.json');

let offersData: OfferItem[] = [
  { id: 1, name: "SMB", price: 7000, isActive: true },
  { id: 2, name: "SML", price: 8000, isActive: true },
  { id: 3, name: "Red Horse", price: 8000, isActive: true },
  { id: 4, name: "Rum Coke", price: 10000, isActive: true }
];

async function loadOffers() {
  try {
    const data = await fs.readFile(OFFERS_FILE, 'utf8');
    offersData = JSON.parse(data);
  } catch (error) {
    // File doesn't exist, use default data
    await saveOffers();
  }
}

async function saveOffers() {
  await fs.writeFile(OFFERS_FILE, JSON.stringify(offersData, null, 2));
}

export const offersStorage = {
  async getOffers(): Promise<OfferItem[]> {
    await loadOffers();
    return offersData;
  },

  async createOffer(item: InsertOfferItem): Promise<OfferItem> {
    await loadOffers();
    const newId = Math.max(...offersData.map(item => item.id), 0) + 1;
    const newOffer: OfferItem = { ...item, id: newId };
    offersData.push(newOffer);
    await saveOffers();
    return newOffer;
  },

  async updateOffer(id: number, updates: Partial<OfferItem>): Promise<OfferItem> {
    await loadOffers();
    const index = offersData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Offer with id ${id} not found`);
    }
    offersData[index] = { ...offersData[index], ...updates };
    await saveOffers();
    return offersData[index];
  },

  async deleteOffer(id: number): Promise<void> {
    await loadOffers();
    const index = offersData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Offer with id ${id} not found`);
    }
    offersData.splice(index, 1);
    await saveOffers();
  },

  async getActiveOffers(): Promise<OfferItem[]> {
    await loadOffers();
    return offersData.filter(item => item.isActive);
  }
};
