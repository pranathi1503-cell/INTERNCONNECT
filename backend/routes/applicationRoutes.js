const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  applyToInternship,
  getMyApplications,
  getApplicationsForReview,
  updateApplicationStatus
} = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

const resumeDir = path.join(__dirname, "..", "uploads", "resumes");
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname || ".pdf");
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, fileName);
  }
});

const uploadResume = multer({ storage });

router.post(
  "/:internshipId/apply",
  authMiddleware,
  authorizeRoles("student"),
  uploadResume.single("resume"),
  applyToInternship
);
router.get("/my", authMiddleware, authorizeRoles("student"), getMyApplications);
router.get(
  "/review",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  getApplicationsForReview
);
router.patch("/:id/status", authMiddleware, authorizeRoles("recruiter", "admin"), updateApplicationStatus);

module.exports = router;
