import {NonRetriableError} from "inngest";
import {sendMail} from "../../utils/mailer";
import {Ticket} from "../../models/ticket";
import {analyzeTicket} from "../../utils/ai";
import {User} from "../../models/user";

export const onTicketCreate=inngest.createFunction(
    {id:"on-ticket-create"},
    {event:"ticket/create"},
    async({event,step})=>{
        try{
            // we are fetching the ticket id from the event data
            const {ticketId}=event.data;

            //fetch ticket from database
           const ticket=await step.run("fetch-ticket",async()=>{
             //since a db operation is involved, we need to use await
              const ticketObject=await Ticket.findById(ticketId);
              if(!ticket){
                throw new NonRetriableError("Ticket not found in our database");
              }
              return ticketObject;
           })
           // we are updating the ticket status to IN_PROGRESS
           await step.run("update-ticket-status",async()=>{
               await Ticket.findByIdAndUpdate(ticketId,{status:"IN_PROGRESS"});
            });
            // utilizing the ai agent to analyze the ticket
            const aiResponse=await analyzeTicket(ticket);
            // if the ai response is not present in the database, we are updating the ticket status to IN_PROGRESS
            const relatedSkills= await step.run("ai-processing",async()=>{
                let skills=[];
               
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        priority:!["low","medium","high"].
                        includes(aiResponse.priority)?"medium":
                        aiResponse.priority,
                        helpfulNotes:aiResponse.helpfulNotes,
                        status:"IN_PROGRESS",
                        relatedSkills:aiResponse.relatedSkills,    
                    })
                    skills=aiResponse.relatedSkills;
                }
                return skills;
            })
            // we are assigning the moderator to the ticket
            const moderator=await step.run("assign-moderator",
                // mongodb pipeline operation
                async()=>{
                    let user=await User.findOne({
                        role:"moderator",
                        skills:{
                            $regex:relatedSkills.join("|"),
                            $options:"i"
                        }
                    })
                    if(!user){
                        user=await User.findOne({role:"admin"});
                    }
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        assignedTo:user?._id || null
                    });
                    return user;
                });
                await step.run("send-email-to-moderator",async()=>{
                    if(moderator){
                        await Ticket.findById(ticket._id)
                        await sendMail(
                            moderator.email,
                            "Ticket Assigned to you",
                            `A new ticket assigned to you: ${ticket.title}`
                        )
                    }
                })
                return {success:true};          
        }catch(error){
            console.error("❌Error in onTicketCreate function:",error.message);
            return {success:false};
        }
    }
);
    
