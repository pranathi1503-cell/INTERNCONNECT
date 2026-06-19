const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET || "dev_jwt_secret",
    { expiresIn: "1d" }
  );

const register = async (req, res) => {
  try {
    const { name, email, password, role, mobile, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeRole = ["student", "recruiter", "admin"].includes(role) ? role : "student";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: safeRole,
      mobile: mobile || "",
      age: age || undefined
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile || "",
        age: user.age || null
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, mobile, age } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If student provides profile details at login, persist them for applications.
    if (user.role === "student") {
      const updates = {};
      if (mobile && typeof mobile === "string") {
        updates.mobile = mobile.trim();
      }
      if (age !== undefined && age !== null && age !== "") {
        const parsedAge = Number(age);
        if (!Number.isNaN(parsedAge) && parsedAge >= 0) {
          updates.age = parsedAge;
        }
      }
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates, { new: true });
        Object.assign(user, updates);
      }
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile || "",
        age: user.age || null
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { register, login };
