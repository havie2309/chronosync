import { Router } from "express";
import { generateScheduleHandler, getWeekScheduleHandler, resetScheduleHandler } from "../controllers/schedule.controller.js";
import { createRateLimit } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const scheduleRouter = Router();
const scheduleMutationRateLimit = createRateLimit({
  name: "schedule:mutation",
  windowMs: 60 * 1000,
  maxRequests: 8
});

scheduleRouter.use(asyncHandler(requireAuth));

scheduleRouter.post("/generate", scheduleMutationRateLimit, asyncHandler(generateScheduleHandler));
scheduleRouter.post("/reset", scheduleMutationRateLimit, asyncHandler(resetScheduleHandler));
scheduleRouter.get("/week", asyncHandler(getWeekScheduleHandler));

export { scheduleRouter };
