import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,default:"user",required:true,enum:["user","moderator","admin"]},
    skills:{type:String},
    createdAt:{type:Date,default:Date.now},
    

})

export const User=mongoose.model("User",userSchema);