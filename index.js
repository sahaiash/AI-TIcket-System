import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/user";
import ticketRoutes from "./routes/ticket";
import {serve} from "./inngest/server";
import {inngest} from "./inngest/client";
import {onSignup} from "./inngest/functions/on-signup";
import {onTicketCreate} from "./inngest/functions/on-ticket-create";
import {onTicketUpdate} from "./inngest/functions/on-ticket-update";


const PORT=process.env.PORT||5000;

const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/ticket",ticketRoutes);
app.use(
   "api/inngest",
   serve({
      client:inngest,
      functions:[onSignup,onTicketCreate]
   })
)
mongoose
   .connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("MongoDB connected");
    app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
})
   .catch((err)=>console.error("MongoDB error:",err));
 

