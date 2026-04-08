import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { router } from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-user-email"]
  })
);

app.use(express.json());
app.use(requestLogger);

app.use("/api", router);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error", error);
  res.status(500).json({ error: "Internal server error" });
});

export { app };
