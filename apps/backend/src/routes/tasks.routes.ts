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

const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.post("/parse", parseTasksHandler);
tasksRouter.post("/bulk", bulkCreateTasksHandler);
tasksRouter.post("/", createTaskHandler);
tasksRouter.get("/", getTasksHandler);
tasksRouter.patch("/:id", updateTaskHandler);
tasksRouter.delete("/:id", deleteTaskHandler);

export { tasksRouter };
