import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { sql } from "drizzle-orm";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "server/.env" });
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MemoryStore = createMemoryStore(session);
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: app.get("env") === "production",
    },
  }),
);

app.use((req, res, next) => {
  const host = req.headers.host?.split(":")[0] ?? "";
  if (
    host === "kestia-boracay.com" &&
    (req.method === "GET" || req.method === "HEAD") &&
    !req.path.startsWith("/api")
  ) {
    res.redirect(301, `https://www.kestia-boracay.com${req.originalUrl}`);
    return;
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      const dbName = parsed.pathname.replace("/", "") || "unknown";
      const sslMode = parsed.searchParams.get("sslmode") || "none";
      log(`DATABASE_URL host=${parsed.hostname} db=${dbName} sslmode=${sslMode}`);
    } catch {
      log("DATABASE_URL set (unparseable)");
    }
  } else {
    log("DATABASE_URL missing");
  }
  if (!process.env.ADMIN_PASSWORD) {
    log("ADMIN_PASSWORD missing (using default, please set for security)");
  }
  const server = await registerRoutes(app);

  // Ensure new vegetarian menu table exists without requiring a manual migration.
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vegetarian_menu_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "menu_item_id" integer NOT NULL,
        "section" text DEFAULT 'regular' NOT NULL,
        "display_order" integer DEFAULT 0 NOT NULL
      );
    `);
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'vegetarian_menu_items_menu_item_id_menu_items_id_fk'
        ) THEN
          ALTER TABLE "vegetarian_menu_items"
          ADD CONSTRAINT "vegetarian_menu_items_menu_item_id_menu_items_id_fk"
          FOREIGN KEY ("menu_item_id")
          REFERENCES "public"."menu_items"("id")
          ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);
  } catch (error) {
    console.error("Failed to ensure vegetarian_menu_items table:", error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Unhandled error:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    const address = server.address();
    if (typeof address === "string") {
      log(`serving on ${address}`);
    } else if (address) {
      log(`serving on ${address.address}:${address.port}`);
    } else {
      log(`serving on port ${port}`);
    }
  });
})();
