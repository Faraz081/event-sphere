import User from "../models/User.js";
import Otp from "../models/Otp.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import sendEmail from "../config/mailerConfig.js";

const otpEmail = (otp) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eadfca;border-radius:16px;overflow:hidden">
  <div style="background:#2f2a24;padding:22px;text-align:center;color:#fff;font-size:22px;font-weight:bold">Event<span style="color:#c49424">Sphere</span></div>
  <div style="padding:32px;text-align:center">
    <h2 style="color:#2f2a24;margin:0 0 12px">Reset Your Password</h2>
    <p style="color:#5d574f;font-size:14px;line-height:1.6">Use the code below to reset your password.</p>
    <div style="margin:24px 0;padding:18px;border:1px dashed #c49424;border-radius:12px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#c49424">${otp}</div>
    <p style="color:#888;font-size:13px">This code expires in <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
  </div>
</div>`;

const passwordResetSuccessEmail = () => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eadfca;border-radius:16px;overflow:hidden">
  <div style="background:#2f2a24;padding:22px;text-align:center;color:#fff;font-size:22px;font-weight:bold">Event<span style="color:#c49424">Sphere</span></div>
  <div style="padding:32px;text-align:center">
    <h2 style="color:#2f2a24;margin:0 0 12px">Password Reset Successful</h2>
    <p style="color:#5d574f;font-size:14px;line-height:1.6">Your EventSphere password has been successfully reset.</p>
    <div style="margin:24px 0;padding:18px;background:#f8f5ef;border-radius:12px;color:#2f2a24;font-size:16px;font-weight:bold">Your password has been changed successfully.</div>
    <p style="color:#888;font-size:13px;line-height:1.6">If you did not make this change, please contact support immediately.</p>
  </div>
</div>`;

const verifyEmail = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });
    const exist = await User.findOne({ email });
    if (!exist) return res.status(404).json({ error: "Email not found" });
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    await Otp.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true });
    await sendEmail(email, "EventSphere - Password Reset OTP", otpEmail(otp));
    return res.status(200).json({ msg: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: "OTP must be exactly 6 digits" });
    }

    const match = await Otp.findOne({ email, otp });
    if (!match) {
      return res.status(401).json({ error: "OTP is incorrect or expired" });
    }

    return res.status(200).json({ msg: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "Email, OTP and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const match = await Otp.findOne({ email, otp });
    if (!match) return res.status(401).json({ error: "OTP is incorrect or expired" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const update = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    if (!update) return res.status(404).json({ error: "User not found" });
    await Otp.deleteOne({ _id: match._id });
    await sendEmail(email, "EventSphere - Password Changed Successfully", passwordResetSuccessEmail());
    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export { verifyEmail, verifyOtp, resetPassword };