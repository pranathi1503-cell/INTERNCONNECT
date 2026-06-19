const Internship = require("../models/Internship");

const getAllInternshipsForAdmin = async (_req, res) => {
  try {
    const internships = await Internship.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      count: internships.length,
      internships
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internships", error: error.message });
  }
};

const approveInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.status(200).json({
      message: "Internship approved successfully",
      internship
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve internship", error: error.message });
  }
};

const rejectInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.status(200).json({
      message: "Internship rejected successfully",
      internship
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject internship", error: error.message });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.status(200).json({ message: "Internship deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete internship", error: error.message });
  }
};

module.exports = {
  getAllInternshipsForAdmin,
  approveInternship,
  rejectInternship,
  deleteInternship
};
