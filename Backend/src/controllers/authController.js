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

const countLetters = (str) => (str.match(/\p{L}/gu) || []).length;

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

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

    if (String(password).length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
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
      const message =
        check.status === "inactive"
          ? "Your account is waiting for admin approval. You can log in once it is activated."
          : "This account is suspended. Please contact support.";

      return res.status(403).json({
        error: message,
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
    let { name, email, password, confirmPassword, role, companyName, phone } =
      req.body;

    name = String(name ?? "").trim().replace(/\s+/g, " ");
    email = String(email ?? "").trim().toLowerCase();
    password = String(password ?? "");
    confirmPassword = String(confirmPassword ?? "");
    phone = String(phone ?? "").trim();
    companyName = String(companyName ?? "").trim().replace(/\s+/g, " ");

    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    // Name: only letters and spaces, at least 3 letters, max 50
    if (
      name.length > 50 ||
      !/^[\p{L}\s]+$/u.test(name) ||
      countLetters(name) < 3
    ) {
      return res.status(400).json({
        msg: "Name must contain only letters and spaces (at least 3 letters, no numbers or special characters)",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        msg: "Please enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
      });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({
        msg: "Password must not contain spaces",
      });
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        msg: "Password must contain at least one letter and one number",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        msg: "Passwords do not match",
      });
    }

    if (!/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        msg: "Phone number must contain exactly 11 digits (numbers only)",
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

    const isExhibitor = publicRole === "exhibitor";

    // Company name: only letters and spaces, at least 3 letters, max 100
    if (isExhibitor) {
      if (!companyName) {
        return res.status(400).json({
          msg: "Company name is required for exhibitors",
        });
      }
      if (
        companyName.length > 100 ||
        !/^[\p{L}\s]+$/u.test(companyName) ||
        countLetters(companyName) < 3
      ) {
        return res.status(400).json({
          msg: "Company name must contain only letters and spaces (at least 3 letters, no numbers or special characters)",
        });
      }
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
      companyName: isExhibitor ? companyName : undefined,
      phone,
      status: isExhibitor ? "inactive" : "active",
      exhibitorStatus: null,
    });

    const user = addUser.toObject();
    delete user.password;

    return res.status(201).json({
      msg: isExhibitor
        ? "Registration successful. You can log in once the admin activates your account."
        : "Registration successful!",
      addUser: user,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const ensureAdminExists = async () => {
  try {
    const existing = await User.findOne({ email: "admin@gmail.com" });
    if (existing) return;

    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashed,
      role: "admin",
      status: "active",
      phone: "03000000000",
    });
    console.log("Default admin account created");
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
  }
};

export { login, register };
export default ensureAdminExists;
