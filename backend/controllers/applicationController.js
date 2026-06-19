const Application = require("../models/Application");
const Internship = require("../models/Internship");
const User = require("../models/User");

const applyToInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);
    if (!internship || internship.status !== "approved") {
      return res.status(404).json({ message: "Internship not found or not approved" });
    }

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const {
      name = "",
      email = "",
      mobile = "",
      skills = ""
    } = req.body;

    const parsedSkills = String(skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const application = await Application.create({
      student: req.user.id,
      internship: req.params.internshipId,
      applicantSnapshot: {
        name: name.trim() || student.name || "",
        email: email.trim() || student.email || "",
        mobile: mobile.trim() || student.mobile || "",
        skills: parsedSkills,
        resumeFile: req.file ? `/uploads/resumes/${req.file.filename}` : "",
        age: student.age || null
      }
    });

    return res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already applied for this internship" });
    }
    return res.status(500).json({ message: "Failed to apply", error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate("internship", "title company duration stipend skillsRequired");

    return res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

const getApplicationsForReview = async (req, res) => {
  try {
    const baseQuery = {};
    if (req.user.role === "recruiter") {
      baseQuery.postedBy = req.user.id;
    }

    const internships = await Internship.find(baseQuery).select("_id");
    const internshipIds = internships.map((item) => item._id);

    if (!internshipIds.length) {
      return res.status(200).json({ count: 0, applications: [] });
    }

    const applications = await Application.find({ internship: { $in: internshipIds } })
      .sort({ createdAt: -1 })
      .populate("internship", "title company duration stipend skillsRequired postedBy")
      .populate("student", "name email mobile age");

    return res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch applications for review", error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id).populate(
      "internship",
      "title company duration stipend skillsRequired postedBy"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      req.user.role === "recruiter" &&
      application.internship &&
      application.internship.postedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "You can update only your posted internships" });
    }

    application.status = status;
    await application.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${application.student.toString()}`).emit("application:status-updated", application);
    }

    return res.status(200).json({ message: "Application status updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

module.exports = {
  applyToInternship,
  getMyApplications,
  getApplicationsForReview,
  updateApplicationStatus
};
