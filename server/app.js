import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import menuRoutes from "./routes/menuRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});

export default app;
