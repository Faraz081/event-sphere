import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, User, Building2 } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  role: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

const RegisterPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();

      toast.success("Registration successful!");
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
    <AuthLayout
      title="Create an Account"
      subtitle="Join EventSphere and start managing events."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-semibold text-foreground"
            >
              Full Name
            </Label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

              <Input
                id="fullName"
                name="name"
                type="text"
                placeholder="John Doe"
                className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label
              htmlFor="company"
              className="text-sm font-semibold text-foreground"
            >
              Company / Organization
            </Label>

            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

              <Input
                id="company"
                name="companyName"
                type="text"
                placeholder="ABC Technologies"
                className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-foreground"
            >
              Email
            </Label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Role
            </Label>

            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-[#eadfc9] bg-[#fffdf9] text-sm shadow-sm">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>

              <SelectContent className="border-[#eadfc9] bg-[#fffdf9] text-[#2f2a24]">
                <SelectItem value="exhibitor">Exhibitor</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </Label>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-foreground"
            >
              Confirm Password
            </Label>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-foreground"
            >
              Phone
            </Label>

            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+92 300 1234567"
              className="h-12 rounded-xl text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Create Account Button */}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-gold text-white font-semibold shadow-sm transition-all hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-gold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;