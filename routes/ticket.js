import express from "express";
import {auth} from "../middlewares/auth";
import { getTicket,createTicket,getTickets } from "../controllers/ticket";

const router=express.Router();
router.get("/",auth,getTickets);
router.get("/:id",auth,getTicket);
router.post("/",auth,createTicket);


export default router;