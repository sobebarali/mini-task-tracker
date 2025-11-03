import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import createTasksController from "./controllers/create.task";
import deleteTasksController from "./controllers/delete.task";
import getTasksController from "./controllers/get.task";
import listTasksController from "./controllers/list.task";
import updateTasksController from "./controllers/update.task";

const router = Router();

// All routes require authentication
router.post("/", authMiddleware, createTasksController);
router.get("/", authMiddleware, listTasksController);
router.get("/:id", authMiddleware, getTasksController);
router.put("/:id", authMiddleware, updateTasksController);
router.delete("/:id", authMiddleware, deleteTasksController);

export default router;
