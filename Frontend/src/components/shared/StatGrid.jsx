import React from 'react'

const StatGrid = ({ children }) => (
  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
    {children}
  </div>
)

export default StatGrid