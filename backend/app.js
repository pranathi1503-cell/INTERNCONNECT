const express = require("express");
const path = require("path");
const internshipRoutes = require("./routes/internshipRoutes");
const adminInternshipRoutes = require("./routes/adminInternshipRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use("/api/internships", internshipRoutes);
app.use("/api/admin", adminInternshipRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
