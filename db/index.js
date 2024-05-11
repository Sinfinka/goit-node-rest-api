import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });

export default app;
