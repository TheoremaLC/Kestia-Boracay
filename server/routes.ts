import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";
import { visitorTracker } from "./visitor-tracking";
import { offersStorage } from "./offers-storage";

export async function registerRoutes(app: Express) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Simple in-memory rate limiter for admin login to slow brute-force attacks.
  // This is intentionally scoped to the login route only to avoid affecting the public site.
  const loginAttemptsByIp = new Map<
    string,
    { count: number; windowStartMs: number; blockedUntilMs?: number }
  >();
  const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const LOGIN_MAX_ATTEMPTS = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || 10);
  const LOGIN_BLOCK_MS = 15 * 60 * 1000; // 15 minutes

  const rateLimitAdminLogin = (req: any, res: any, next: any) => {
    const now = Date.now();
    const ip = String(req.ip || req.connection?.remoteAddress || "unknown");

    const entry = loginAttemptsByIp.get(ip);
    if (!entry) {
      loginAttemptsByIp.set(ip, { count: 0, windowStartMs: now });
      return next();
    }

    if (entry.blockedUntilMs && now < entry.blockedUntilMs) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.blockedUntilMs - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ error: "Too many login attempts. Try again later." });
    }

    if (now - entry.windowStartMs > LOGIN_WINDOW_MS) {
      entry.count = 0;
      entry.windowStartMs = now;
      delete entry.blockedUntilMs;
      return next();
    }

    if (entry.count >= LOGIN_MAX_ATTEMPTS) {
      entry.blockedUntilMs = now + LOGIN_BLOCK_MS;
      const retryAfterSec = Math.max(1, Math.ceil(LOGIN_BLOCK_MS / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ error: "Too many login attempts. Try again later." });
    }

    return next();
  };

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!adminUsername || !adminPassword) {
      return res.status(503).json({ error: "Admin login not configured" });
    }
    if (req.session?.isAdmin) {
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  };

  app.post("/api/admin/login", rateLimitAdminLogin, (req, res) => {
    if (!adminUsername || !adminPassword) {
      return res.status(503).json({ error: "Admin login not configured" });
    }
    const { username, password } = req.body || {};
    if (username === adminUsername && password === adminPassword) {
      // Successful login: reset counter for this IP to avoid locking out real staff.
      const ip = String(req.ip || req.connection?.remoteAddress || "unknown");
      loginAttemptsByIp.delete(ip);
      req.session.isAdmin = true;
      return res.json({ ok: true });
    }

    // Failed login: count attempts.
    const ip = String(req.ip || req.connection?.remoteAddress || "unknown");
    const now = Date.now();
    const entry = loginAttemptsByIp.get(ip);
    if (!entry) {
      loginAttemptsByIp.set(ip, { count: 1, windowStartMs: now });
    } else if (now - entry.windowStartMs > LOGIN_WINDOW_MS) {
      loginAttemptsByIp.set(ip, { count: 1, windowStartMs: now });
    } else {
      entry.count += 1;
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/admin/me", (req, res) => {
    if (req.session?.isAdmin) {
      return res.json({ ok: true });
    }
    return res.status(401).json({ error: "Unauthorized" });
  });

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
  app.get("/api/visitor-stats", requireAdmin, async (_req, res) => {
    try {
      const stats = await visitorTracker.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get visitor stats" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const type = req.query.type as 'food' | 'drink' | undefined;
      const categories = await storage.getCategories(type);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.updateCategory(id, req.body);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to update category" });
    }
  });

  app.get("/api/categories/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      const items = await storage.getItemsInCategory(category.slug);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get items in category" });
    }
  });

  app.post("/api/categories/move-items", requireAdmin, async (req, res) => {
    try {
      const { fromCategorySlug, toCategorySlug } = req.body;
      await storage.moveItemsToCategory(fromCategorySlug, toCategorySlug);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to move items" });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category";
      res.status(400).json({ error: message });
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

  app.post("/api/menu", requireAdmin, async (req, res) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to create menu item" });
    }
  });

  app.put("/api/menu/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateMenuItem(id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu/category/:slug", requireAdmin, async (req, res) => {
    try {
      const slug = req.params.slug;
      await storage.deleteItemsInCategory(slug);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete items in category" });
    }
  });

  app.delete("/api/menu/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete menu item" });
    }
  });

  // Debug endpoint to check IDs
  app.get("/api/debug/menu", requireAdmin, async (_req, res) => {
    const allItems = await storage.getMenuItems();
    const simplifiedItems = allItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category
    }));
    res.json(simplifiedItems);
  });

  // Drinks
  app.get("/api/drinks", async (_req, res) => {
    const items = await storage.getDrinks();
    res.json(items);
  });

  app.get("/api/drinks/:category", async (req, res) => {
    const category = req.params.category;
    const items = await storage.getDrinksByCategory(category);
    res.json(items);
  });

  app.post("/api/drinks", requireAdmin, async (req, res) => {
    try {
      const item = await storage.createDrink(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to create drink item" });
    }
  });

  app.put("/api/drinks/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateDrink(id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Failed to update drink item" });
    }
  });

  app.delete("/api/drinks/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDrink(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete drink item" });
    }
  });

  // Debug endpoint to check drink IDs
  app.get("/api/debug/drinks", requireAdmin, async (_req, res) => {
    const allItems = await storage.getDrinks();
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

  app.post("/api/offers", requireAdmin, async (req, res) => {
    try {
      const offer = await offersStorage.createOffer(req.body);
      res.status(201).json(offer);
    } catch (error) {
      res.status(400).json({ error: "Failed to create offer" });
    }
  });

  app.put("/api/offers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await offersStorage.updateOffer(id, req.body);
      res.json(offer);
    } catch (error) {
      res.status(400).json({ error: "Failed to update offer" });
    }
  });

  app.delete("/api/offers/:id", requireAdmin, async (req, res) => {
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
