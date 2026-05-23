import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";

// Load environment variables
dotenv.config({ path: "./env/.env" });

// Connect to Database
connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  console.log(`Server is running on: ${base}`);
});
