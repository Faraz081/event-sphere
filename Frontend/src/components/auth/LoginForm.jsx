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

    navigate("/dashboard");

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <Checkbox id="remember" />

        <Label
          htmlFor="remember"
          className="cursor-pointer text-sm font-normal"
        >
          Remember me
        </Label>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gold text-background hover:bg-gold/90"
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