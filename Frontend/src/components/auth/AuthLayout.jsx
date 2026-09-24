import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-surface p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-gold">
              EventSphere
            </h1>

            <div className="mb-6 mt-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {title}
              </h2>

              <p className="mt-2 text-sm text-muted">{subtitle}</p>
            </div>
          </div>

          {children}

          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link
              to="/home"
              className="inline-flex items-center text-sm font-medium text-gold transition-colors hover:text-gold/80"
            >
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
