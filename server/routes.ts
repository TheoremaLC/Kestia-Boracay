import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Menu Items
  app.get("/api/menu", async (_req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.get("/api/menu/:category", async (req, res) => {
    const items = await storage.getMenuItemsByCategory(req.params.category);
    res.json(items);
  });

  // Events
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  // Reservations
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservation = insertReservationSchema.parse(req.body);
      const created = await storage.createReservation(reservation);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid reservation data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
