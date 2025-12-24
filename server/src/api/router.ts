/**
 * @file server/src/api/router.ts
 * @description Main API router - mounts sub-routers and health endpoint
 */

import { Router } from "express";
import { authRouter } from "./auth.js";
import { uploadRouter } from "./uploads.js";
import { referralRouter } from "./referrals.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/referrals", referralRouter);

export { apiRouter };
