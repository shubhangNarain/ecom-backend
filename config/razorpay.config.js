import Razorpay from "razorpay";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config({ path: "./env/.env" });

const keyId = (process.env.RAZORPAY_TEST_KEY || "").trim();
const keySecret = (process.env.RAZORPAY_TEST_SECRET || "").trim();

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
