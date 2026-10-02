import React from "react";
import { useSelector } from "react-redux";
import { Building2, CalendarDays, Mail, Phone, UserRound } from "lucide-react";

const ProfileDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-[#eadfc9] bg-white/70 p-4">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c49424]/10 text-[#a8790d]">
      <Icon size={18} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#82786b]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-[#2f2a24]">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const AttendeeProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-[70vh] bg-[#f8f5ef] px-5 pb-20 pt-32 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8790d]">
            Your EventSphere account
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
            Attendee Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5d574f]">
            Your account details in one place.
          </p>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-[#fffdf9] shadow-[0_24px_70px_-36px_rgba(89,65,25,0.3)]">
          <div className="bg-gradient-to-r from-[#f2e7d3] via-[#fff8ea] to-[#f8f5ef] px-6 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#c49424] font-serif text-2xl font-bold text-white shadow-md">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8790d]">
                  {user.role}
                </p>
                <h2 className="mt-1 break-words font-serif text-3xl font-semibold text-[#2f2a24]">
                  {user.name}
                </h2>
                <p className="mt-1 break-words text-sm text-[#5d574f]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
            <ProfileDetail icon={UserRound} label="Full name" value={user.name} />
            <ProfileDetail icon={Mail} label="Email" value={user.email} />
            <ProfileDetail icon={Phone} label="Phone" value={user.phone} />
            <ProfileDetail
              icon={Building2}
              label="Company / organization"
              value={user.companyName}
            />
            <ProfileDetail
              icon={CalendarDays}
              label="Member since"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default AttendeeProfile;
