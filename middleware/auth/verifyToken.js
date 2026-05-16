import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Token is not valid" });
        }
        req.user = decoded;
        next();
      }
    );
  } else {
    res.status(401).json({ message: "You are not authenticated" });
  }
};

export default verifyToken;
