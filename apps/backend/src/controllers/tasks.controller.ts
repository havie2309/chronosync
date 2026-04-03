import type { Request, Response } from "express";
import { parseGoalsToTasks } from "../services/parse.service.js";
import { createTask, deleteTask, getTasksForUser, updateTask } from "../services/tasks.service.js";

async function createTaskHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    title,
    description,
    durationMinutes,
    priority,
    deadline,
    recurrence,
    preferredTimeWindow,
    estimatedEffort,
    status
  } = req.body as {
    title?: string;
    description?: string;
    durationMinutes?: number;
    priority?: number;
    deadline?: string;
    recurrence?: string;
    preferredTimeWindow?: string;
    estimatedEffort?: string;
    status?: string;
  };

  if (!title || !durationMinutes) {
    return res.status(400).json({
      error: "title and durationMinutes are required"
    });
  }

  const task = await createTask({
    userId: req.user.id,
    title,
    description,
    durationMinutes,
    priority,
    deadline,
    recurrence,
    preferredTimeWindow,
    estimatedEffort,
    status
  });

  return res.status(201).json({ task });
}

async function parseTasksHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { text } = req.body as { text?: string };

  if (!text) {
    return res.status(400).json({
      error: "text is required"
    });
  }

  const result = await parseGoalsToTasks({ text });

  return res.status(200).json(result);
}

async function getTasksHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tasks = await getTasksForUser(req.user.id);
  return res.status(200).json({ tasks });
}

async function updateTaskHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const task = await updateTask({
    userId: req.user.id,
    taskId: req.params.id,
    ...req.body
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(200).json({ task });
}

async function deleteTaskHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await deleteTask(req.user.id, req.params.id);

  if (!result) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(200).json(result);
}

export { createTaskHandler, deleteTaskHandler, getTasksHandler, parseTasksHandler, updateTaskHandler };
