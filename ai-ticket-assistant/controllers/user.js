import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";
import { sendMail } from "../utils/mailer.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    console.log("Signup attempt:", { email, password: "***", skills });
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, skills });
    console.log("User created:", user.email);

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    console.log("Token created successfully");

    // Send welcome email event to Inngest
    try {
      await inngest.send({
        name: "user/signup",
        data: {
          email,
        },
      });
      console.log("Welcome email event sent successfully");
    } catch (inngestError) {
      console.error("Welcome email event failed (but signup still completed):", inngestError.message);
      
      // Send welcome email directly using existing sendMail function
      setTimeout(async () => {
        try {
          await sendMail(email, "Welcome to TicketFlow!", `Welcome ${email}! Your account is ready.`);
          console.log("✅ Welcome email sent directly");
        } catch (emailError) {
          console.error("❌ Direct email failed:", emailError.message);
        }
      }, 1000);
    }

    res.json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ 
        error: "Email already exists", 
        message: "An account with this email already exists. Please use a different email or try logging in." 
      });
    }
    
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
    });
    res.json({ message: "Logout successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};