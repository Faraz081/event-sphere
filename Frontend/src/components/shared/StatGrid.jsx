import React from 'react'

const StatGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
    {children}
  </div>
)

export default StatGrid