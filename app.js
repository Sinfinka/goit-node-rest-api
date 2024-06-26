import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import contactsRouter from "./routes/contactsRouter.js";
import userRouter from "./routes/userRouter.js";
import authMiddleware from "./middlewares/auth.js";
import path from "path";

import app from "./db/index.js";

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/contacts", authMiddleware, contactsRouter);
app.use("/users", userRouter);
app.use("/avatars", express.static(path.resolve("public", "avatars")));

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});
