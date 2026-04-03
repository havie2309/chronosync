import type { Request, Response } from "express";
import { findOrCreateUser } from "../services/auth.service.js";

async function createSession(req: Request, res: Response) {
  const { email, name, photoUrl } = req.body as {
    email?: string;
    name?: string;
    photoUrl?: string;
  };

  if (!email) {
    return res.status(400).json({
      error: "Email is required"
    });
  }

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
