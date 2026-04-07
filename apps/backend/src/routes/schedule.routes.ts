import { Router } from "express";
import { generateScheduleHandler, getWeekScheduleHandler } from "../controllers/schedule.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const scheduleRouter = Router();

scheduleRouter.use(asyncHandler(requireAuth));

scheduleRouter.post("/generate", asyncHandler(generateScheduleHandler));
scheduleRouter.get("/week", asyncHandler(getWeekScheduleHandler));

export { scheduleRouter };
