import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";


const LoginPage = () => {
  return (
    <AuthLayout
  title="Welcome Back"
  subtitle="Sign in to continue managing your expos."
>
  <LoginForm />
</AuthLayout>
  );
};

export default LoginPage;