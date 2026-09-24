import React from "react";
import StatGrid from "@/components/ui/StatGrid";
import ExhibitorLayout from "@/dashboard/layouts/ExhibitorLayout";
import StatCard from "../StatCard";

const stats = [
  {
    label: "My Booth",
    value: "B-12",
  },
  {
    label: "Products",
    value: "18",
  },
  {
    label: "Meetings",
    value: "9",
  },
  {
    label: "Messages",
    value: "5",
  },
];

const ExhibitorPortal = () => {
  return (
    <ExhibitorLayout>
      <div className="p-4 md:p-8">
        <h1 className="mb-2 font-display text-2xl md:text-4xl font-bold text-foreground">
          Exhibitor Dashboard
        </h1>

        <div className="mb-6">
          <p className="text-muted text-sm md:text-base">
            Manage your booth, products, profile, and communications from one place.
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
    </ExhibitorLayout>
  );
};

export default ExhibitorPortal;