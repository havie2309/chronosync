import type { Request, Response } from "express";
import { generateSchedule, getWeekSchedule, resetSchedule } from "../services/schedule.service.js";

async function generateScheduleHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { weekStart } = req.body as {
    weekStart?: string;
  };

  const result = await generateSchedule({
    userId: req.user.id,
    weekStart
  });

  return res.status(201).json(result);
}

async function getWeekScheduleHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const weekStart = typeof req.query.weekStart === "string" ? req.query.weekStart : undefined;

  const result = await getWeekSchedule({
    userId: req.user.id,
    weekStart
  });

  return res.status(200).json(result);
}

async function resetScheduleHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { weekStart } = req.body as {
    weekStart?: string;
  };

  const result = await resetSchedule({
    userId: req.user.id,
    weekStart
  });

  return res.status(200).json(result);
}

export { generateScheduleHandler, getWeekScheduleHandler, resetScheduleHandler };
