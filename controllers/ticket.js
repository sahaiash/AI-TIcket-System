import {inngest} from "../inngest/client";
import {Ticket} from "../models/ticket";


// controller for creating a ticket
export const createTicket=async(req,res)=>{
    try{
        // validating the request body
        const {title,description}=req.body;
        if(!title || !description){
            return res.status(400).json({error:"Title and description are required"});
        }
        // creating a new ticket
        const newTicket=Ticket.create({
            title,
            description,
            createdBy:req.user._id.toString(),
        }) 
        await inngest.send({
            // AI pipeline for ticket creation
            name:"ticket/created",
            data:{
                ticketId:(await newTicket)._id.toString(),
                createdBy:req.user._id.toString(),
                title,
                description,
            }
        });
        res.json({message:"Ticket created successfully",ticket:newTicket});
    }catch(error){
        console.error("❌Error in createTicket function:",error.message);
        return res.status(500).json({error:"Ticket creation failed",details:error.message});
    }
}

// controller for getting all tickets
export const getTickets=async(req,res)=>{
    try{
        const user=req.user;
        let tickets=[];
        if(user.role!=="user"){
            tickets=await Ticket.find({}).populate("assignedTo",["email","_id"])
            .sort({createdAt:-1});
        }else{
            tickets=await Ticket.find({createdBy:user._id})
                .select("title description status createdAt")
                .sort({createdAt:-1});
        }
        return res.status(200).json({tickets});
    }catch(error){
        console.log("❌Error in getTickets function:",error.message);
        return res.status(500).json({message:"Internal server erorr"});

    }
}

// controller for getting a single ticket
export const getTicket=async(req,res)=>{

}

