import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  console.log("Auth headers:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Extracted token:", token ? "Token present" : "No token");

  if (!token) {
    console.log("No token found in request");
    return res.status(401).json({ error: "Access Denied. No token found." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded._id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};