import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text, fromEmail = null) => {
  try {
    console.log("📧 Sending email to:", to);
    
    // Choose email service based on environment variables
    let transporter;
    
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Gmail configuration for real emails
      console.log("📧 Using Gmail service");
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
        },
      });
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Generic SMTP configuration
      console.log("📧 Using custom SMTP service");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Mailtrap for testing
      console.log("📧 Using Mailtrap (testing only - emails won't reach real addresses)");
      transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: parseInt(process.env.MAILTRAP_SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.MAILTRAP_SMTP_USER,
          pass: process.env.MAILTRAP_SMTP_PASS,
        },
      });
    }

    // Determine sender email
    const senderEmail = fromEmail || process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'support@ticketflow.com';
    const senderName = fromEmail ? `TicketFlow Admin` : 'TicketFlow Support';
    
    console.log("📧 Sending from:", `${senderName} <${senderEmail}>`);

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 2rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #3b82f6; font-size: 2rem; margin-bottom: 0.5rem;">TicketFlow</h1>
            <p style="color: #64748b;">Support Notification</p>
          </div>
          
          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px;">
            <h3 style="color: #1e293b; margin-bottom: 1rem;">${subject}</h3>
            <div style="color: #475569; line-height: 1.6;">
              ${text.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 0.9rem;">
              This is an automated message from TicketFlow Support System
            </p>
          </div>
        </div>
      `
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};