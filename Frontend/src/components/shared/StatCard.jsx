import React from 'react'

const StatCard = ({ label, value }) => (
  <div className="relative bg-surface border border-border rounded-lg p-4 md:p-6 overflow-hidden">
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border border-border" />
    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border border-border" />

    <p className="text-muted text-xs md:text-sm mb-2 truncate">{label}</p>
    <p className="font-mono text-xl md:text-3xl font-semibold text-foreground truncate">{value}</p>
  </div>
)

export default StatCard