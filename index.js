import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/user";

const PORT=process.env.PORT||5000;

const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
mongoose
   .connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("MongoDB connected");
    app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
})
   .catch((err)=>console.error("MongoDB error:",err));
 

