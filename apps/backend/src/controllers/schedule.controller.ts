import type { Request, Response } from "express";
import { generateSchedule, getWeekSchedule, resetSchedule } from "../services/schedule.service.js";
import { formatZodError, scheduleBodySchema } from "../validation/requestSchemas.js";

async function generateScheduleHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsedBody = scheduleBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: formatZodError(parsedBody.error)
    });
  }

  const result = await generateSchedule({
    userId: req.user.id,
    weekStart: parsedBody.data.weekStart
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

  const parsedBody = scheduleBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: formatZodError(parsedBody.error)
    });
  }

  const result = await resetSchedule({
    userId: req.user.id,
    weekStart: parsedBody.data.weekStart
  });

  return res.status(200).json(result);
}

export { generateScheduleHandler, getWeekScheduleHandler, resetScheduleHandler };
