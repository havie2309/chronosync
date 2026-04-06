import type { Request, Response } from "express";
import { getMetricsSummary } from "../services/metrics.service.js";

async function getMetricsSummaryHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const summary = await getMetricsSummary(req.user.id);

  return res.status(200).json(summary);
}

export { getMetricsSummaryHandler };
