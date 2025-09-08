import jwt from "jsonwebtoken";

export const auth=async(req,res,next)=>{
    const token=req.headers.authorization.split(" ")[1];
    if(!token) return res.status(401).json({err:"Access denied"});
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
         res.status(500).json({err:"Access denied",details:err.message});
    }
};