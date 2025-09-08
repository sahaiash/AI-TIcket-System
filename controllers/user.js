import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { Inngest } from "inngest";


export const signup=async(req,res)=>{
    const {email,password,skills=[]}=req.body
    try{
       const hashed= bcrypt.hash(password,10);
       const user=await User.create({email,password:hashed,skills});

       // fire inngest event
       await Inngest.send({
        name:"user/signup",
        data:{
            email,
        }
       });
       const token=jwt.sign(
        {_id:user.id,
            role:user.role
        },
        process.env.JWT_SECRET,
       );
       res.json({user,token});


    }catch(err){
        res.status(500).json({err:"Signup failed",details:err.message});
    }
}
export const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=User.findOne({email});
        if(!user) return res.status(401).json({err:"Invalid credentials"});
       const isMatch=awaitbcrypt.compare(password,user.password);
       if(!isMatch){
        return res.status(401).json({error:"Invalid credentials"});

       }
       const token=jwt.sign(
        {_id:user.id,
            role:user.role
        },
        process.env.JWT_SECRET,
       );
       res.json({user,token});
    }catch(err){
        res.status(500).json({err:"Login failed",details:err.message});
    }
}
export const logout=async(req,res)=>{
    // many ways to logout 
    // 1. remove token from client
    // 2. remove token from server
    // 3. remove token from database
    // 4. remove token from browser
    // 5. remove token from mobile app
    // 6. remove token from api
    // 7. remove token from cli
    try{
        const token=req.headers.authorization.split(" ")[1];
        if(!token) return res.status(401).json({err:"Unauthorized"});
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err) return res.status(401).json({err:"Unauthorized"});
            res.json({message:"Logged out successfully"});
        });
    }catch(err){
        res.status(500).json({err:"Logout failed",details:err.message});
    }
}
// updating the user skills and role
export const updateUser=async(req,res)=>{
    const {skills=[],role,email}=req.body;
    try{
        if(req.user.role!="admin") return res.status(403).json({err:"Forbidden"});
        const user=await User.findOne({email});
        if(!user) return res.status(401).json({err:"User not found"});

        await User.updateOne(
            {email},
            {skills:skills.length?skills:user.skills}    
        );
        return res.json({message:"User updated successfully"});
    }catch(err){
        res.status(500).json({err:"Update failed",details:err.message});
    }
}
// getting all the users
export const getUser=async (req,res)=>{
    try{
      if(req.user.role!="admin") return res.status(403).json({err:"Forbidden"});
      const users=await User.find().select("-password");
      return res.json({users});
    }catch(err){
        res.status(500).json({err:"Get user failed",details:err.message});
    }

}