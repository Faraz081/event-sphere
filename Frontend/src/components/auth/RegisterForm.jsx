import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  try {
   const response = await fetch(
  `${import.meta.env.VITE_API_URL || "http://localhost:3200"}/api/register`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
      companyName: formData.companyName,
      phone: formData.phone,
    }),
  }
);

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || data.msg || "Registration failed");
      return;
    }

    toast.success("Registration successful!");

    console.log("Registered user:", data.addUser);

    setFormData({
      name: "",
      companyName: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });

    navigate("/login");

  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Unable to connect to the server");
  }
};

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">Full Name</Label>

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
          <Label htmlFor="company" className="text-sm font-semibold text-foreground">
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
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>

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
          <Label className="text-sm font-semibold text-foreground">Role</Label>

          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                role: value,
              })
            }
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-[#eadfc9] bg-[#fffdf9] text-sm shadow-sm">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>

            <SelectContent className="border-[#eadfc9] bg-[#fffdf9] text-[#2f2a24]">
              <SelectItem value="exhibitor">
                Exhibitor
              </SelectItem>

              <SelectItem value="attendee">
                Attendee
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>

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
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
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
          <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone</Label>

          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-gold font-semibold text-white shadow-md shadow-[#c49424]/20 transition hover:-translate-y-0.5 hover:bg-gold/90"
      >
        Create Account
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
  );
};

export default RegisterForm;
