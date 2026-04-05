import { Router } from "express";
import { generateScheduleHandler, getWeekScheduleHandler, resetScheduleHandler } from "../controllers/schedule.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const scheduleRouter = Router();

scheduleRouter.use(asyncHandler(requireAuth));

scheduleRouter.post("/generate", asyncHandler(generateScheduleHandler));
scheduleRouter.post("/reset", asyncHandler(resetScheduleHandler));
scheduleRouter.get("/week", asyncHandler(getWeekScheduleHandler));

export { scheduleRouter };
