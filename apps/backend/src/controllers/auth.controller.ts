import type { Request, Response } from "express";
import { findOrCreateUser } from "../services/auth.service.js";
import { createSessionBodySchema, formatZodError } from "../validation/requestSchemas.js";

async function createSession(req: Request, res: Response) {
  const parsedBody = createSessionBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: formatZodError(parsedBody.error)
    });
  }

  const { email, name, photoUrl } = parsedBody.data;

  const user = await findOrCreateUser({
    email,
    name,
    photoUrl
  });

  return res.status(200).json({
    user
  });
}

async function getMe(req: Request, res: Response) {
  return res.status(200).json({
    user: req.user
  });
}

export { createSession, getMe };
