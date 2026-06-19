require("dotenv").config();
const mongoose = require("mongoose");
const Internship = require("../models/Internship");

const recruiterId = new mongoose.Types.ObjectId();

const internships = [
  {
    title: "Frontend Developer Intern",
    company: "PixelCraft Labs",
    domain: "Frontend",
    description: "Build responsive web interfaces and reusable UI components.",
    location: "Bengaluru",
    stipend: "INR 20000/month",
    duration: "3 months",
    skillsRequired: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "Backend Engineer Intern",
    company: "CoreStack Systems",
    domain: "Backend",
    description: "Develop REST APIs and optimize server-side performance.",
    location: "Hyderabad",
    stipend: "INR 25000/month",
    duration: "4 months",
    skillsRequired: ["Node.js", "Express", "MongoDB", "REST API", "JWT"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "AI Research Intern",
    company: "NeuroGrid AI",
    domain: "AI",
    description: "Prototype machine learning models for NLP applications.",
    location: "Pune",
    stipend: "INR 30000/month",
    duration: "6 months",
    skillsRequired: ["Python", "PyTorch", "Transformers", "NLP", "Git"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "Data Science Intern",
    company: "InsightMatrix Analytics",
    domain: "Data Science",
    description: "Analyze datasets and build dashboards for business insights.",
    location: "Mumbai",
    stipend: "INR 28000/month",
    duration: "5 months",
    skillsRequired: ["Python", "Pandas", "NumPy", "SQL", "Power BI"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "DevOps Intern",
    company: "DeployWave Tech",
    domain: "DevOps",
    description: "Automate CI/CD pipelines and monitor deployment workflows.",
    location: "Chennai",
    stipend: "INR 26000/month",
    duration: "4 months",
    skillsRequired: ["Docker", "Kubernetes", "GitHub Actions", "Linux", "AWS"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "Mobile App Intern",
    company: "SwiftByte Mobility",
    domain: "Mobile",
    description: "Create cross-platform mobile features for consumer apps.",
    location: "Noida",
    stipend: "INR 22000/month",
    duration: "3 months",
    skillsRequired: ["Flutter", "Dart", "Firebase", "REST API", "Git"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "Cybersecurity Intern",
    company: "SecureNexus",
    domain: "Cybersecurity",
    description: "Assist in vulnerability assessment and security hardening.",
    location: "Gurugram",
    stipend: "INR 30000/month",
    duration: "6 months",
    skillsRequired: ["Network Security", "OWASP", "Burp Suite", "SIEM", "Linux"],
    postedBy: recruiterId,
    status: "approved"
  },
  {
    title: "Cloud Engineering Intern",
    company: "SkyScale Cloud",
    domain: "Cloud",
    description: "Support cloud infrastructure setup and cost optimization.",
    location: "Remote",
    stipend: "INR 27000/month",
    duration: "4 months",
    skillsRequired: ["AWS", "Terraform", "CloudWatch", "Linux", "Shell Scripting"],
    postedBy: recruiterId,
    status: "approved"
  }
];

const seedInternships = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Internship.deleteMany({});
    await Internship.insertMany(internships);
    console.log("Internships seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedInternships();
