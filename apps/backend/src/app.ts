import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);

app.use(express.json());

app.use("/api", router);

export { app };
