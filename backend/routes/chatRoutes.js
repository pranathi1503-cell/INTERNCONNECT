const express = require("express");
const { chatWithClaude } = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatWithClaude);

module.exports = router;
