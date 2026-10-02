import React from 'react'

const ResponsiveTable = ({ children, minWidth = "640px" }) => (
  <div className="bg-surface border border-border rounded-lg overflow-hidden md:overflow-x-auto">
    <table className="w-full text-left responsive-table" style={{ minWidth }}>
      {children}
    </table>
  </div>
)

export default ResponsiveTable