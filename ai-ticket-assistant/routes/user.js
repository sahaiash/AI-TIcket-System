import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
  getAssignableUsers,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);
router.get("/assignable-users", authenticate, getAssignableUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;