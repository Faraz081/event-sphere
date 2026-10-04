import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import loginSignupBg from "../../assets/login-signup-bg.jpg";
import { loginUser } from "@/store/slices/authSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
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
      setFormData({ email: "", password: "" });

      navigate(user.role === "attendee" ? "/" : "/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.error || error?.msg || "Unable to connect to the server."
      );
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-24"
      style={{ backgroundImage: `url(${loginSignupBg})` }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden bg-[#f8f5ef] p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="mb-6 flex items-center font-serif text-3xl font-semibold tracking-wide text-[#2f2a24]">
            <Sparkles className="mr-2 h-8 w-8 text-[#c49424]" />
            Event<span className="text-[#c49424]">Sphere</span>
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight text-[#2f2a24]">
            Welcome Back
            <br />
            <span className="text-[#c49424]">
              To EventSphere
            </span>
          </h1>

          <p className="mt-6 leading-7 text-[#5d574f]">
            Sign in to manage your events, exhibitors, schedules and attendees
            from one simple platform.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
              Login
            </h2>

            <p className="mt-2 text-sm text-[#5d574f]">
              Enter your details to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2f2a24]">
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
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#2f2a24]">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#c49424] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Login"}
            </button>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#c49424] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#5d574f]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#c49424] hover:underline"
            >
              Sign Up
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

export default LoginPage;