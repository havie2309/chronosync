import { Router } from "express";
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

router.use("/auth", authRouter);
router.use("/metrics", metricsRouter);
router.use("/tasks", tasksRouter);
router.use("/schedule", scheduleRouter);

export { router };
