const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"],
      default: "Applied"
    },
    applicantSnapshot: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      mobile: { type: String, default: "" },
      skills: [{ type: String }],
      resumeFile: { type: String, default: "" },
      age: { type: Number, default: null }
    }
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
