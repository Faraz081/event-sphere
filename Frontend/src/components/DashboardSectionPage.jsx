import React from "react";
import StatGrid from "@/components/ui/StatGrid";
import StatCard from "@/components/StatCard";

const DashboardSectionPage = ({ title, description, stats = [], children }) => {
  return (
    <section className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-muted text-sm md:text-base">{description}</p>
      </div>

      {stats.length > 0 && (
        <StatGrid>
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </StatGrid>
      )}

      {children}
    </section>
  );
};

export default DashboardSectionPage;