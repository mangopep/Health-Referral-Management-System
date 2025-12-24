/**
 * File: server/src/app.ts
 * Responsibility: Configure Express app with middleware and routes (no listener)
 * Used by: server/src/index.ts, server/src/tests/integration/api.test.ts
 * Side effects: No - exports configured app instance, does not start server
 * Notes: Separated from index.ts to allow Cloud Functions to import app without listener
 */

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapi.js";
import { apiRouter } from "./api/router.js";

// Create Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api")) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        }
    });
    next();
});

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Mount API Router
app.use("/api", apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server Error:", err);
    res.status(status).json({ message });
});

export { app };
