import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";
import { visitorTracker } from "./visitor-tracking";
import { offersStorage } from "./offers-storage";

export async function registerRoutes(app: Express) {
  // Visitor tracking middleware for main site pages
  app.use((req, res, next) => {
    // Only track non-API, non-admin requests
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      visitorTracker.trackVisitor(ip, userAgent).catch(console.error);
    }
    next();
  });

  // Visitor stats endpoint
  app.get("/api/visitor-stats", async (_req, res) => {
    try {
      const stats = await visitorTracker.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get visitor stats" });
    }
  });
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

  app.post("/api/menu", async (req, res) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to create menu item" });
    }
  });

  app.put("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateMenuItem(id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete menu item" });
    }
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

  // Offers
  app.get("/api/offers", async (_req, res) => {
    try {
      const offers = await offersStorage.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get offers" });
    }
  });

  app.get("/api/offers/active", async (_req, res) => {
    try {
      const offers = await offersStorage.getActiveOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active offers" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const offer = await offersStorage.createOffer(req.body);
      res.status(201).json(offer);
    } catch (error) {
      res.status(400).json({ error: "Failed to create offer" });
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await offersStorage.updateOffer(id, req.body);
      res.json(offer);
    } catch (error) {
      res.status(400).json({ error: "Failed to update offer" });
    }
  });

  app.delete("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await offersStorage.deleteOffer(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete offer" });
    }
  });

  // Reservations - TEMPORARILY DISABLED
  app.get("/api/reservations", async (_req, res) => {
    // const reservations = await storage.getReservations();
    res.json([]);
  });

  app.post("/api/reservations", async (req, res) => {
    // try {
    //   console.log('Received reservation data:', req.body); // Debug log
    //   const reservation = insertReservationSchema.parse(req.body);
    //   const created = await storage.createReservation(reservation);
    //   res.status(201).json(created);
    // } catch (error: any) {
    //   console.error('Reservation validation error:', error); // Debug log
    //   res.status(400).json({ 
    //     error: "Invalid reservation data",
    //     details: error.errors || error.message 
    //   });
    // }
    res.status(503).json({ error: "Reservations temporarily disabled" });
  });

  // Update reservation status
  app.patch("/api/reservations/:id/status", async (req, res) => {
    // try {
    //   const id = parseInt(req.params.id);
    //   const { status } = req.body;
    //   const updated = await storage.updateReservationStatus(id, status);
    //   res.json(updated);
    // } catch (error) {
    //   res.status(400).json({ error: "Failed to update reservation status" });
    // }
    res.status(503).json({ error: "Reservations temporarily disabled" });
  });

  const httpServer = createServer(app);
  return httpServer;
}