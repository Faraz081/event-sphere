import React from "react";
import AttendeeLayout from "@/dashboard/layouts/AttendeeLayout";
import StatGrid from "@/components/ui/StatGrid";
import StatCard from "../StatCard";

const stats = [
  {
    label: "Events",
    value: "8",
  },
  {
    label: "Sessions",
    value: "12",
  },
  {
    label: "Bookmarked",
    value: "4",
  },
  {
    label: "Exhibitors",
    value: "56",
  },
];

const AttendeeHome = () => {
  return (
    <AttendeeLayout>
      <div className="p-4 md:p-8">
        <h1 className="mb-2 font-display text-2xl md:text-4xl font-bold text-foreground">
          Attendee Dashboard
        </h1>

        <div className="mb-6">
          <p className="text-muted text-sm md:text-base">
            Explore events, discover exhibitors, and manage your personalized event schedule.
          </p>
        </div>

        <StatGrid>
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </StatGrid>
      </div>
    </AttendeeLayout>
  );
};

export default AttendeeHome;