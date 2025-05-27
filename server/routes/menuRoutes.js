import express from "express";
import {
  getAllMenuItems,
  uploadMenuItems,
  deleteAllMenuItems,
  getMenuItemById,
  searchMenuItems,
} from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getAllMenuItems);
router.get("/search", searchMenuItems);
router.get("/:id", getMenuItemById);
router.post("/upload", uploadMenuItems);
router.delete("/", deleteAllMenuItems);

export default router;