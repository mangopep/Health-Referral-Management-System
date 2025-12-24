/**
 * @file server/src/routes.ts
 * @description Legacy routes stub - maintained for compatibility
 */

import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Server endpoints will be added in Phase 4
  return httpServer;
}
