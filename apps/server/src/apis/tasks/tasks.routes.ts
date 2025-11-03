import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as taskController from "./controllers/task.controllers";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Task routes
router.get("/", taskController.getTasks); // GET /api/tasks
router.post("/", taskController.createTask); // POST /api/tasks
router.put("/:id", taskController.updateTask); // PUT /api/tasks/:id
router.delete("/:id", taskController.deleteTask); // DELETE /api/tasks/:id

export default router;
