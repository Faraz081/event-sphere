import React from 'react'

const ResponsiveTable = ({ children, minWidth = "0px" }) => (
  <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-surface md:overflow-hidden">
    <table
      className="w-full table-fixed text-left responsive-table"
      style={{ '--table-min-width': minWidth }}
    >
      {children}
    </table>
  </div>
)

export default ResponsiveTable