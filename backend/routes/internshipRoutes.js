const express = require("express");
const { createInternship, getApprovedInternships } = require("../controllers/internshipController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("recruiter"), createInternship);
router.get("/", getApprovedInternships);

module.exports = router;
