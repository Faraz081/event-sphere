import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  UserRound,
  Mail,
  Lock,
  UserPlus,
  Building2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import loginSignupBg from "../../assets/login-signup-bg.jpg";
import { registerUser } from "@/store/slices/authSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialFormData = {
  name: "",
  companyName: "",
  email: "",
  role: "attendee",
  password: "",
  confirmPassword: "",
  phone: "",
};

const inputClass =
  "w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 text-black placeholder:text-gray-400 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20";

const labelClass = "mb-2 block text-sm font-semibold text-[#2f2a24]";

const countLetters = (str) => (str.match(/\p{L}/gu) || []).length;
const lettersOnly = /^[\p{L}\s]+$/u;

// Email: local part letter se start ho, number/dot/symbol se nahi
const emailRegex =
  /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Phone: 03XXXXXXXXX, +923XXXXXXXXX, 021XXXXXXXX (Karachi landline), +9221XXXXXXXX
const phoneRegex = /^(\+92|0)(3\d{9}|21\d{8})$/;

const RegisterPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: digits, aur sirf shuru mein ek "+" allowed
    // "+" se start ho to max 13 chars (+923001234567), warna max 11
    if (name === "phone") {
      let cleaned = value.replace(/[^\d+]/g, "");
      const hasPlus = cleaned.startsWith("+");
      cleaned = (hasPlus ? "+" : "") + cleaned.replace(/\+/g, "");
      cleaned = cleaned.slice(0, hasPlus ? 13 : 11);

      setFormData((prev) => ({ ...prev, phone: cleaned }));
      return;
    }

    // Name / Company: sirf letters aur spaces
    if (name === "name" || name === "companyName") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/[^\p{L}\s]/gu, ""),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const name = formData.name.trim().replace(/\s+/g, " ");
    const companyName = formData.companyName.trim().replace(/\s+/g, " ");
    const email = formData.email.trim();
    const { password, confirmPassword, phone, role } = formData;

    if (!name || !email || !password || !confirmPassword || !phone) {
      return "All fields are required";
    }
    if (name.length > 50 || !lettersOnly.test(name) || countLetters(name) < 3) {
      return "Name must contain only letters and spaces (at least 3 letters)";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email (must start with a letter)";
    }
    if (email.includes("..")) {
      return "Email cannot contain consecutive dots";
    }
    if (!role) {
      return "Please select your role";
    }
    if (role === "exhibitor") {
      if (!companyName) return "Company name is required for exhibitors";
      if (
        companyName.length > 100 ||
        !lettersOnly.test(companyName) ||
        countLetters(companyName) < 3
      ) {
        return "Company name must contain only letters and spaces (at least 3 letters)";
      }
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (/\s/.test(password)) {
      return "Password must not contain spaces";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return "Password must contain at least one letter and one number";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    if (!phoneRegex.test(phone)) {
      return "Phone number must start with +92, 03 or 021 (e.g. 03001234567, +923001234567, 02112345678)";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const data = await dispatch(registerUser(formData)).unwrap();

      toast.success(data?.msg || "Registration successful!", {
        duration: formData.role === "exhibitor" ? 7000 : 4000,
      });
      setFormData(initialFormData);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error?.error || error?.msg || "Unable to connect to the server"
      );
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-16 lg:px-10"
      style={{ backgroundImage: `url(${loginSignupBg})` }}
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#eadfca] bg-white shadow-xl lg:grid-cols-2">

        {/* Left Side - Branding */}
        <div className="relative hidden overflow-hidden bg-[#f8f5ef] p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c49424]/10" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#c49424]/10" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center font-serif text-3xl font-semibold tracking-wide text-[#2f2a24]">
              <Sparkles className="mr-2 h-8 w-8 text-[#c49424]" />
              Event<span className="text-[#c49424]">Sphere</span>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Join EventSphere
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#2f2a24] sm:text-5xl">
              Create Your
              <br />
              <span className="text-[#c49424]">
                Event Journey
              </span>
            </h1>

            <p className="mt-6 max-w-md leading-7 text-[#5d574f]">
              Join EventSphere and make your event planning experience
              simpler, smarter and more organized.
            </p>

            <div className="mt-8 space-y-4 text-sm text-[#5d574f]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Manage events easily
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Organize attendees and exhibitors
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Plan memorable experiences
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="p-8 sm:p-12 lg:p-14">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <UserPlus className="h-7 w-7 text-[#c49424]" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-[#5d574f]">
              Sign up to get started with EventSphere
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="fullName"
                    name="name"
                    type="text"
                    maxLength={50}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className={labelClass}>
                  Company / Organization
                </label>

                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="company"
                    name="companyName"
                    type="text"
                    maxLength={100}
                    placeholder="ABC Technologies"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>Role</label>

                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="h-[50px] data-[size=default]:h-[50px] w-full rounded-xl border-[#eadfca] bg-[#fffdf9] px-4 text-base text-black data-[placeholder]:text-gray-400 shadow-none focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20 focus-visible:border-[#c49424] focus-visible:ring-2 focus-visible:ring-[#c49424]/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>

                  <SelectContent className="border-[#eadfc9] bg-[#fffdf9] text-[#69635b]">
                    <SelectItem value="exhibitor">Exhibitor</SelectItem>
                    <SelectItem value="attendee">Attendee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={13}
                    placeholder="03001234567 or +923001234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#c49424] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5d574f]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#c49424] hover:underline"
            >
              Login
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-[#c49424] hover:underline"
            >
              Back To Website
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
};

export default RegisterPage;