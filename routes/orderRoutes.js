import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.send("Hello POST World!");
});

router.get("/", (req, res) => {
  res.send("Hello GET World!");
});

export default router;
