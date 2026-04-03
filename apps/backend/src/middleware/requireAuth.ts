import type { NextFunction, Request, Response } from "express";
import { getUserByEmail } from "../services/auth.service.js";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const email = req.header("x-user-email");

  if (!email) {
    return res.status(401).json({
      error: "Unauthorized: missing x-user-email header"
    });
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: user not found"
    });
  }

  req.user = user;
  next();
}

export { requireAuth };
