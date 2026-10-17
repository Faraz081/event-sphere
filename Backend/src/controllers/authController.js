import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const withoutPassword = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

const cleanText = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
const isLettersOnly = (text, maxLength) =>
  text.length <= maxLength && /^[\p{L}\s]+$/u.test(text) && (text.match(/\p{L}/gu) || []).length >= 3;

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const foundUser = await User.findOne({ email }).select("+password");
    if (!foundUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Password or Email is incorrect" });
    }

    if (foundUser.status !== "active") {
      const message =
        foundUser.status === "inactive" ? "Your account is waiting for admin approval. You can log in once it is activated." : "This account is suspended. Please contact support.";
      return res.status(403).json({ error: message });
    }

    const token = createAuthToken(foundUser);
    return res.status(200).json({ msg: "User login successfully", user: withoutPassword(foundUser), token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { role } = req.body;
    const name = cleanText(req.body.name);
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    const confirmPassword = String(req.body.confirmPassword ?? "");
    const phone = String(req.body.phone ?? "").trim();
    const companyName = cleanText(req.body.companyName);

    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    if (!isLettersOnly(name, 50)) {
      return res.status(400).json({
        msg: "Name must contain only letters and spaces (at least 3 letters, no numbers or special characters)",
      });
    }
    if (!/^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email" });
    }
    if (email.includes("..")) {
      return res.status(400).json({ msg: "Email cannot contain consecutive dots" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }
    if (/\s/.test(password)) {
      return res.status(400).json({ msg: "Password must not contain spaces" });
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ msg: "Password must contain at least one letter and one number" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }
    if (!/^(\+92|0)(3\d{9}|21\d{8})$/.test(phone)) {
      return res.status(400).json({ msg: "Phone number must start with +92, 03 or 021" });
    }

    if (role === "admin") {
      return res.status(403).json({ error: "Admin accounts cannot be created through public registration." });
    }
    const publicRole = role || "attendee";
    if (!["exhibitor", "attendee"].includes(publicRole)) {
      return res.status(400).json({ msg: "Invalid public registration role" });
    }

    const isExhibitor = publicRole === "exhibitor";
    if (isExhibitor) {
      if (!companyName) {
        return res.status(400).json({ msg: "Company name is required for exhibitors" });
      }
      if (!isLettersOnly(companyName, 100)) {
        return res.status(400).json({
          msg: "Company name must contain only letters and spaces (at least 3 letters, no numbers or special characters)",
        });
      }
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ error: "This email is already registered" });
    }

    const newUser = await User.create({name, email,password: await bcrypt.hash(password, 10), role: publicRole, companyName: isExhibitor ? companyName : undefined, phone, status: isExhibitor ? "inactive" : "active", exhibitorStatus: null});

    return res.status(201).json({
      msg: isExhibitor ? "Registration successful. You can log in once the admin activates your account." : "Registration successful!",
      addUser: withoutPassword(newUser),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const ensureAdminExists = async () => {
  try {
    if (await User.findOne({ email: "admin@gmail.com" })) return;

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin123", 10),
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