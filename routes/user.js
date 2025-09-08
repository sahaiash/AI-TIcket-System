import express from "express";
import { signup,login,logout,updateUser,getUser } from "../controllers/user";
import { auth } from "../middlewares/auth";


const router=express.Router();

router.post("/update-user",auth,updateUser);
router.get("/get-user",auth,getUser);

router.post("/signup",signup);
router.post("login",login);
router.post("/logout",logout);

export default router;