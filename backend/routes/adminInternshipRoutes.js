const express = require("express");
const {
  getAllInternshipsForAdmin,
  approveInternship,
  rejectInternship,
  deleteInternship
} = require("../controllers/adminInternshipController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("admin"));

router.get("/internships", getAllInternshipsForAdmin);
router.patch("/internships/:id/approve", approveInternship);
router.patch("/internships/:id/reject", rejectInternship);
router.delete("/internships/:id", deleteInternship);

module.exports = router;
