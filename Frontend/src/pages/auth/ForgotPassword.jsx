import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import loginSignupBg from "../../assets/login-signup-bg.jpg";
import { sendResetOtp, setEmail } from "@/store/slices/forgotPasswordSlice";

const ForgotPassword = () => {
  const [emailInput, setEmailInput] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = emailInput.trim().toLowerCase();

      await dispatch(sendResetOtp(email)).unwrap();

      dispatch(setEmail(email));

      toast.success("OTP sent to your email.");

      navigate("/verify-otp");
    } catch (error) {
      toast.error(
        error?.error ||
        error?.msg ||
        "Unable to send OTP."
      );
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-24"
      style={{ backgroundImage: `url(${loginSignupBg})` }}
    >
      <div className="w-full max-w-md rounded-[2rem] border border-[#eadfca] bg-white p-8 shadow-xl sm:p-10">

        <div className="mb-8 flex items-center justify-center font-serif text-2xl font-semibold text-[#2f2a24]">
          <Sparkles className="mr-2 h-6 w-6 text-[#c49424]" />
          Event<span className="text-[#c49424]">Sphere</span>
        </div>

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4d9]">
            <Mail className="h-7 w-7 text-[#c49424]" />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold text-[#2f2a24]">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#5d574f]">
            Enter your email address and we'll help you reset your password.
          </p>

        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#2f2a24]">
              Email Address
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

              <input
                type="email"
                placeholder="Enter your email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3.5 pl-12 pr-4 text-black placeholder:text-gray-500 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#c49424] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <div className="mt-7 text-center">

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#c49424] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

        </div>

      </div>
    </main>
  );
};

export default ForgotPassword;