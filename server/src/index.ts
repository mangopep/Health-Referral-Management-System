/**
 * File: server/src/index.ts
 * Responsibility: Start HTTP server for local development (imports app from app.ts)
 * Used by: npm run dev, npm run start
 * Side effects: Yes - starts HTTP listener on PORT (default 5001) when not in Cloud Functions
 * Notes: Skips listener if FUNCTION_TARGET is set (Cloud Functions environment)
 */

import { createServer } from "http";
import { app } from "./app.js";

// Create HTTP Server
const httpServer = createServer(app);

// Server Initialization (local dev only, not in Cloud Functions)
if (process.env.NODE_ENV !== "test" && !process.env.FUNCTION_TARGET) {
  const port = parseInt(process.env.PORT || "5001", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  });
}

// Export for testing
export { app };
