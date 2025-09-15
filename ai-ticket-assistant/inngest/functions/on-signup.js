
import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in our database");
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        // Get admin email to use as sender
        const adminUser = await User.findOne({ role: "admin" });
        const adminEmail = adminUser ? adminUser.email : null;
        
        const subject = `Welcome to TicketFlow - Your Account is Ready!`;
        const message = `Hello ${user.email.split('@')[0]},

Welcome to TicketFlow! Your account has been successfully created.

You can now:
• Create support tickets for IT issues
• Track the status of your requests
• Receive updates on ticket progress
• Access our AI-powered support system

Getting Started:
1. Log into TicketFlow at: http://localhost:5174
2. Create your first support ticket
3. Track your ticket progress in the dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
TicketFlow Admin Team`;
        
        await sendMail(user.email, subject, message, adminEmail);
        console.log("✅ Welcome email sent to:", user.email);
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false };
    }
  }
);
