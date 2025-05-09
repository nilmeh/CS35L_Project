import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import menuRoutes from "./routes/menuRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/mealplans", mealPlanRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("API is running!");
});

export default app;
