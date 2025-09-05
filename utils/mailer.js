import nodemailer from "nodemailer";

export const sendMail=async(to,subject,text)=>{
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_HOST_USER,
              pass: process.env.EMAIL_HOST_PASSWORD,
            },
        });
        const info = await transporter.sendMail({
            from:"Inngest TMS",
            to,
            subject,
            text, // plain‑text body
          });
          console.log("Message sent:",info.messageId);
          return info;      
    } catch (error) {
        console.error("❌Error sending email:",error.message);
        throw error;
    }

}