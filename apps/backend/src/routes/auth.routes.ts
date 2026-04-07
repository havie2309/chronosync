import { Router } from "express";
import { createSession, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authRouter = Router();

authRouter.post("/session", asyncHandler(createSession));
authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getMe));

export { authRouter };
