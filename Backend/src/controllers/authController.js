import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        msg: "Please enter a valid email",
      });
    }

    const check = await User.findOne({ email }).select("+password");

    if (!check) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    const checkPassword = await bcrypt.compare(password, check.password);

    if (!checkPassword) {
      return res.status(401).json({
        error: "Password or Email is incorrect",
      });
    }

    if (check.status !== "active") {
      return res.status(403).json({
        error: "This account is not active. Please contact support.",
      });
    }

    const token = createAuthToken(check);
    const user = check.toObject();
    delete user.password;

    return res.status(200).json({
      msg: "User login successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      companyName,
      phone,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        msg: "Please enter a valid email",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        msg: "Passwords do not match",
      });
    }

    if (!/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        msg: "Phone number must contain exactly 11 digits",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        error: "Admin accounts cannot be created through public registration.",
      });
    }

    const publicRole = role || "attendee";
    if (!["exhibitor", "attendee"].includes(publicRole)) {
      return res.status(400).json({
        msg: "Invalid public registration role",
      });
    }

    const oldUsers = await User.findOne({ email });

    if (oldUsers) {
      return res.status(409).json({
        error: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

       const addUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: publicRole,
      companyName,
      phone,
      // Agar exhibitor register kare to pending approval pe rakho
      status: publicRole === "exhibitor" ? "inactive" : "active",
      exhibitorStatus: publicRole === "exhibitor" ? "pending" : null,
    });

    const user = addUser.toObject();
    delete user.password;

    return res.status(201).json({
      msg: "registered",
      addUser: user,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export { login, register };
