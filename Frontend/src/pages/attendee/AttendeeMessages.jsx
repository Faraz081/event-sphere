import React from "react";
import { useNavigate } from "react-router-dom";
import MessagesPanel from "@/components/shared/MessagesPanel";

const AttendeeMessages = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fffaf2] px-4 pt-24 pb-12 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/ongoing-events")}
          className="mb-6 text-sm font-medium text-[#9a721c] transition-colors hover:text-[#c49424]"
        >
          ← Back to Expos
        </button>

        <h1 className="font-serif text-2xl md:text-4xl font-bold text-[#2f2a24] mb-2">
          Messages
        </h1>

        <p className="text-[#5d574f] text-sm md:text-base mb-6">
          Chat with exhibitors about their products and services.
        </p>

        <MessagesPanel attendee />
      </div>
    </div>
  );
};

export default AttendeeMessages;