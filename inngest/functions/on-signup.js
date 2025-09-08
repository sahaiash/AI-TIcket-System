import { NonRetriableError } from "inngest";
import {inngest} from "../client";
import User from "/models/user";


export const onSignup=inngest.createFunction(
    {id:"on-user-signup"},
    {event:"user/signup"},
    async({event,step})=>{
        try{
            // pipeline-1
            const {email,name}=event.data; 
            await step.run("send-activation-email",async()=>{
               const userObject=awaitUser.findOne({email});
               if(!userObject){
                throw new NonRetriableError("User not found in our database");
               }
               return userObject;
            });
            // pipeline-2
            await setp.run("send-welcome-email",async()=>{
                const subject="Welcome to the Application";
                const message=`Hello ${name},
                \n\n
                Thank you for signing up for the application.
                \n\n
                Best regards,
                \n\n
                AI-Ticket Assistant`;
                await sendMail(userObject.email,subject,message);
                return {message:"Welcome email sent successfully"};
            })
            return {success:true};
        }
        catch(error){
            console.error("❌Error in onSignup function:",error.message);
            return {success:false};
        }
    }
); 