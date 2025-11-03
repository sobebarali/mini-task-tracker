import { Router } from "express";
import { loginAuth } from "./controllers/login.auth";
import { signupAuth } from "./controllers/signup.auth";

const router = Router();

// Custom Routes
router.post("/signup", signupAuth); // POST /api/auths/signup
router.post("/login", loginAuth); // POST /api/auths/login

export default router;
