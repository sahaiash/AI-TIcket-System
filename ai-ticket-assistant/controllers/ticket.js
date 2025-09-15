import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    console.log("Creating ticket for user:", req.user._id);
    console.log("Request body:", req.body);
    const { title, description, category, priority } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id.toString(),
    });
    console.log("Ticket created successfully:", newTicket._id);

    // Send Inngest event for AI processing
    try {
      console.log("Sending Inngest event for ticket:", newTicket._id);
      await inngest.send({
        name: "ticket/created",
        data: {
          ticketId: newTicket._id.toString(),
        },
      });
      console.log("Inngest event sent successfully");
    } catch (inngestError) {
      console.error("Inngest event failed (but ticket still created):", inngestError.message);
      // Don't fail the ticket creation if Inngest fails
    }

    // Direct AI processing as fallback
    try {
      console.log("🤖 Starting direct AI processing for ticket:", newTicket._id);
      const { default: analyzeTicket } = await import("../utils/ai.js");
      
      // Run AI analysis directly
      setTimeout(async () => {
        try {
          const aiResponse = await analyzeTicket(newTicket);
          
          if (aiResponse) {
            console.log("✅ Direct AI analysis successful:", aiResponse);
            await Ticket.findByIdAndUpdate(newTicket._id, {
              priority: !["low", "medium", "high"].includes(aiResponse.priority)
                ? newTicket.priority || "medium"
                : aiResponse.priority,
              helpfulNotes: aiResponse.helpfulNotes,
              status: "IN_PROGRESS",
              relatedSkills: aiResponse.relatedSkills,
            });
            console.log("✅ Ticket updated with AI analysis");
          } else {
            console.log("⚠️ AI analysis failed, using basic processing");
            await Ticket.findByIdAndUpdate(newTicket._id, {
              helpfulNotes: `Issue: ${newTicket.description}. Category: ${newTicket.category}. Please review and assist the user.`,
              status: "IN_PROGRESS",
              relatedSkills: ["Technical Support"],
            });
          }
        } catch (aiError) {
          console.error("❌ Direct AI processing error:", aiError.message);
        }
      }, 2000); // Process after 2 seconds
      
    } catch (directAIError) {
      console.error("❌ Failed to start direct AI processing:", directAIError.message);
    }

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    console.log("Fetching tickets for user:", req.user);
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", "email")
        .sort({ createdAt: -1 });
    }
    console.log("Found tickets:", tickets.length);
    console.log("Sample ticket data:", tickets[0] ? {
      id: tickets[0]._id,
      title: tickets[0].title,
      status: tickets[0].status,
      priority: tickets[0].priority,
      helpfulNotes: tickets[0].helpfulNotes ? "Present" : "Missing",
      relatedSkills: tickets[0].relatedSkills
    } : "No tickets");
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).populate('assignedTo', 'email').populate('createdBy', 'email');
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;
    
    console.log("Delete request from user:", user._id, "for ticket:", ticketId);
    
    let ticket;
    
    // Check permissions - admin can delete any ticket, users can only delete their own
    if (user.role === "admin") {
      ticket = await Ticket.findById(ticketId);
    } else {
      // Regular users can only delete tickets they created
      ticket = await Ticket.findOne({
        _id: ticketId,
        createdBy: user._id
      });
    }

    if (!ticket) {
      return res.status(404).json({ 
        message: user.role === "admin" 
          ? "Ticket not found" 
          : "Ticket not found or you don't have permission to delete it" 
      });
    }

    // Delete the ticket
    await Ticket.findByIdAndDelete(ticketId);
    
    console.log("Ticket deleted successfully:", ticketId);
    
    return res.status(200).json({ 
      message: "Ticket deleted successfully",
      deletedTicketId: ticketId
    });
    
  } catch (error) {
    console.error("Error deleting ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};