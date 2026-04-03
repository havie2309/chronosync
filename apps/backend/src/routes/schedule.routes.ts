import { Router } from "express";
import { generateScheduleHandler, getWeekScheduleHandler } from "../controllers/schedule.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const scheduleRouter = Router();

scheduleRouter.use(requireAuth);

scheduleRouter.post("/generate", generateScheduleHandler);
scheduleRouter.get("/week", getWeekScheduleHandler);

export { scheduleRouter };
