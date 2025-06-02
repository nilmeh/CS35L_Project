import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import menuRoutes from "./routes/menuRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRoutes);
app.use("/api/mealplans", mealPlanRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});

export default app;
