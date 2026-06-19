const jwt = require("jsonwebtoken");
const Internship = require("../models/Internship");

const extractOptionalUser = (req) => {
  if (req.user) {
    return req.user;
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.decode(token);
  return decoded || null;
};

const createInternship = async (req, res) => {
  try {
    const {
      title,
      company,
      domain,
      description,
      location,
      stipend,
      duration,
      skillsRequired
    } = req.body;

    const internship = await Internship.create({
      title,
      company,
      domain,
      description,
      location,
      stipend,
      duration,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
      postedBy: req.user.id,
      status: "pending"
    });

    return res.status(201).json({
      message: "Internship created and sent for admin approval",
      internship
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create internship", error: error.message });
  }
};

const getApprovedInternships = async (req, res) => {
  try {
    const { domain, location, company, duration, skill } = req.query;
    const filter = { status: "approved" };

    if (domain) filter.domain = domain;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (company) filter.company = { $regex: company, $options: "i" };
    if (duration) filter.duration = { $regex: duration, $options: "i" };
    if (skill) filter.skillsRequired = { $in: [new RegExp(skill, "i")] };

    const internships = await Internship.find(filter).sort({ createdAt: -1 });

    const viewer = extractOptionalUser(req);

    return res.status(200).json({
      count: internships.length,
      viewer,
      internships
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internships", error: error.message });
  }
};

module.exports = {
  createInternship,
  getApprovedInternships
};
