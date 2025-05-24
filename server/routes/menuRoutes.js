import express from "express";
import {
  getAllMenuItems,
  uploadMenuItems,
  deleteAllMenuItems
} from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getAllMenuItems);
router.post("/upload", uploadMenuItems);
router.delete("/", deleteAllMenuItems);

export default router;