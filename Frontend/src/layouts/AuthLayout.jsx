import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Sparkles } from "lucide-react";

const AuthLayout = ({ title, subtitle, children }) => {
  const websiteSettings = useSelector((state) => state.websiteSettings.settings);
  const websiteName = websiteSettings?.websiteName?.trim() || "";
  const logo = websiteSettings?.logo?.trim();
  const heroImage = websiteSettings?.hero?.image?.trim();

  return (
    <div className="auth-theme min-h-screen lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#29251f] bg-cover bg-center lg:block"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}>
          
        <div className="absolute inset-0 bg-linear-to-t from-[#211a12]/90 via-[#211a12]/35 to-[#211a12]/10" />
        <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <Link to="/home" className="inline-flex w-fit items-center gap-3 text-white">
            {logo ? (
              <img src={logo} alt="" className="max-h-10 max-w-40 object-contain" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-[#f2c14e] backdrop-blur">
                <Sparkles size={20} />
              </span>
            )}
            {websiteName && <span className="font-display text-2xl font-semibold">{websiteName}</span>}
          </Link>

          <div className="max-w-xl pb-5 text-white">
            <span className="mb-5 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f2c14e] backdrop-blur">
              Events, beautifully brought together
            </span>
            <h2 className="font-display text-5xl font-semibold leading-[1.08] xl:text-6xl">
              Make room for
              <span className="block text-[#e4b02e]">unforgettable.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              Plan with confidence, bring your people together, and make every detail feel effortless.
            </p>
            <div className="mt-10 flex items-center gap-3 text-sm text-white/70">
              <span className="h-px w-10 bg-[#e4b02e]" />
              Your next great event starts here
            </div>
          </div>

          {websiteName && (
            <p className="text-xs tracking-wide text-white/60">
              {websiteName.toUpperCase()} · EVENT MANAGEMENT
            </p>
          )}
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-background px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/home" className="inline-flex items-center gap-2 font-display text-xl font-semibold text-foreground lg:hidden">
            {logo ? (
              <img src={logo} alt="" className="max-h-8 max-w-32 object-contain" />
            ) : (
              <Sparkles size={19} className="text-gold" />
            )}
            {websiteName}
          </Link>
          <Link to="/home" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-white hover:text-foreground">
            <ArrowLeft size={16} />
            <span>Back to website</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-10">
          <div className="mb-8">
            {websiteName && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Welcome to {websiteName}
              </p>
            )}
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-base leading-7 text-muted">{subtitle}</p>
          </div>

          <section className="rounded-[1.75rem] border border-[#eadfc9] bg-[#fffdf9] p-5 shadow-[0_24px_70px_-32px_rgba(89,65,25,0.28)] sm:p-8">
            {children}
          </section>

          <p className="mt-6 text-center text-xs text-muted">
            Thoughtfully planned. Beautifully experienced.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;