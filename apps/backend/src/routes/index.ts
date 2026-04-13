import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authRouter } from "./auth.routes.js";
import { metricsRouter } from "./metrics.routes.js";
import { scheduleRouter } from "./schedule.routes.js";
import { tasksRouter } from "./tasks.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "chronosync-backend"
  });
});

router.get(
  "/health/details",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      ok: true,
      service: "chronosync-backend",
      checks: {
        api: "ok",
        database: "ok"
      }
    });
  })
);

router.use("/auth", authRouter);
router.use("/metrics", metricsRouter);
router.use("/tasks", tasksRouter);
router.use("/schedule", scheduleRouter);

export { router };
