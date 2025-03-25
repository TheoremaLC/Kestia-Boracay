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
    const category = req.params.category;
    const items = await storage.getMenuItemsByCategory(category);
    res.json(items);
  });

  // Debug endpoint to check IDs
  app.get("/api/debug/menu", async (_req, res) => {
    const allItems = await storage.getMenuItems();
    const simplifiedItems = allItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category
    }));
    res.json(simplifiedItems);
  });
  
  // Events
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  // Reservations
  app.get("/api/reservations", async (_req, res) => {
    const reservations = await storage.getReservations();
    res.json(reservations);
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      console.log('Received reservation data:', req.body); // Debug log
      const reservation = insertReservationSchema.parse(req.body);
      const created = await storage.createReservation(reservation);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Reservation validation error:', error); // Debug log
      res.status(400).json({ 
        error: "Invalid reservation data",
        details: error.errors || error.message 
      });
    }
  });

  // Update reservation status
  app.patch("/api/reservations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateReservationStatus(id, status);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update reservation status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}