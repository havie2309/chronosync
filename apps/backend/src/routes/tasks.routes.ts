import { Router } from "express";
import {
  bulkCreateTasksHandler,
  createTaskHandler,
  deleteTaskHandler,
  getTasksHandler,
  parseTasksHandler,
  updateTaskHandler
} from "../controllers/tasks.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const tasksRouter = Router();

tasksRouter.use(asyncHandler(requireAuth));

tasksRouter.post("/parse", asyncHandler(parseTasksHandler));
tasksRouter.post("/bulk", asyncHandler(bulkCreateTasksHandler));
tasksRouter.post("/", asyncHandler(createTaskHandler));
tasksRouter.get("/", asyncHandler(getTasksHandler));
tasksRouter.patch("/:id", asyncHandler(updateTaskHandler));
tasksRouter.delete("/:id", asyncHandler(deleteTaskHandler));

export { tasksRouter };
