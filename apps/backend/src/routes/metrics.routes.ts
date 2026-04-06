import { Router } from "express";
import { getMetricsSummaryHandler } from "../controllers/metrics.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const metricsRouter = Router();

metricsRouter.use(asyncHandler(requireAuth));

metricsRouter.get("/summary", asyncHandler(getMetricsSummaryHandler));

export { metricsRouter };
