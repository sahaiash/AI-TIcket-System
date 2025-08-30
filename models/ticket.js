import mongoose from "mongoose";

const ticketSchema=new mongoose.Schema({});

export const Ticket=mongoose.model("Ticket",ticketSchema);