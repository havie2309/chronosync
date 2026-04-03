import { Router } from "express";
import { createSession, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const authRouter = Router();

authRouter.post("/session", createSession);
authRouter.get("/me", requireAuth, getMe);

export { authRouter };
