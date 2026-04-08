import { Router } from "express";
import {
  bulkCreateTasksHandler,
  createTaskHandler,
  deleteTaskHandler,
  getTasksHandler,
  parseTasksHandler,
  updateTaskHandler
} from "../controllers/tasks.controller.js";
import { createRateLimit } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const tasksRouter = Router();
const parseRateLimit = createRateLimit({
  name: "tasks:parse",
  windowMs: 60 * 1000,
  maxRequests: 10
});
const bulkSaveRateLimit = createRateLimit({
  name: "tasks:bulk",
  windowMs: 60 * 1000,
  maxRequests: 20
});

tasksRouter.use(asyncHandler(requireAuth));

tasksRouter.post("/parse", parseRateLimit, asyncHandler(parseTasksHandler));
tasksRouter.post("/bulk", bulkSaveRateLimit, asyncHandler(bulkCreateTasksHandler));
tasksRouter.post("/", asyncHandler(createTaskHandler));
tasksRouter.get("/", asyncHandler(getTasksHandler));
tasksRouter.patch("/:id", asyncHandler(updateTaskHandler));
tasksRouter.delete("/:id", asyncHandler(deleteTaskHandler));

export { tasksRouter };
