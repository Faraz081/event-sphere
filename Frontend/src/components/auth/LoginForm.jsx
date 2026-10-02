import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!formData.email || !formData.password) {
    toast.error("Please fill in all fields.");
    return;
  }

  try {
    const result = await dispatch(loginUser(formData)).unwrap();

    const user = result.user;

    toast.success(`Welcome back, ${user.name}!`);

    setFormData({
      email: "",
      password: "",
    });

    navigate(user.role === "attendee" ? "/" : "/dashboard");

  } catch (error) {
    console.error("Login error:", error);

    toast.error(
      error?.error ||
      error?.msg ||
      "Unable to connect to the server."
    );
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
          />
        </div>
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            className="h-12 rounded-xl pl-11 text-sm shadow-sm placeholder:text-muted/70 focus-visible:ring-gold/20"
          />
        </div>
      </div>

   {/* Forgot Password */}
<div className="flex w-full justify-end">
  <Link
    to="/forgot-password"
    className="text-sm font-medium text-gold hover:underline"
  >
    Forgot password?
  </Link>
</div>

      {/* Login Button */}
      <Button
        type="submit"
        disabled={loading}
          className="h-12 w-full rounded-xl bg-gold font-semibold text-white shadow-md shadow-[#c49424]/20 transition hover:-translate-y-0.5 hover:bg-gold/90"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-gold hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
