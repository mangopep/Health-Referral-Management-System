/**
 * @file server/src/tests/integration/api.test.ts
 * @description Integration tests for API security and authentication
 */

import request from "supertest";
import { app } from "../../index";
import { describe, it, expect, vi } from "vitest";

describe("API Integration", () => {
    describe("Security Headers & Auth", () => {
        it("should reject unauthorized access to /api/uploads", async () => {
            const res = await request(app)
                .post("/api/uploads")
                .send({ events: [] });
            expect(res.status).toBe(401);
        });

        it("should reject unauthorized access to /api/referrals", async () => {
            const res = await request(app).get("/api/referrals");
            expect(res.status).toBe(401);
        });

        it("should allow public access to /api/docs", async () => {
            // Swagger UI redirects or loads html
            const res = await request(app).get("/api/docs/");
            // 200 or 301/302 depending on trailing slash handling
            expect(res.status).toBeLessThan(400);
        });
    });


});
