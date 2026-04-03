import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { tasksRouter } from "./tasks.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "chronosync-backend"
  });
});

router.use("/auth", authRouter);
router.use("/tasks", tasksRouter);

export { router };
