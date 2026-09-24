import React from 'react'
import AdminLayout from "@/dashboard/layouts/AdminLayout"
import ResponsiveTable from "@/components/ui/ResponsiveTable"
import { mockSchedule } from "@/data/mockData"

const formatTime = (time24) => {
  const [hours, minutes] = time24.split(":")
  const hoursNum = parseInt(hours, 10)
  const period = hoursNum >= 12 ? "PM" : "AM"
  const hours12 = hoursNum % 12 || 12
  return `${hours12}:${minutes} ${period}`
}

const AdminSchedule = () => (
  <AdminLayout>
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
          Schedule
        </h1>
        <p className="text-muted text-sm md:text-base">Manage sessions, speakers, and time slots.</p>
      </div>

      <ResponsiveTable minWidth="720px">
        <thead className="border-b border-border">
          <tr>
            <th className="px-6 py-3 text-sm text-muted font-medium">Session</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Speaker</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Time</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Location</th>
          </tr>
        </thead>
       <tbody>
  {mockSchedule.map((session) => (
    <tr key={session.id} className="border-b border-border last:border-0">
      <td data-label="Session" className="px-6 py-4 text-foreground font-medium">{session.sessionTitle}</td>
      <td data-label="Speaker" className="px-6 py-4 text-muted">{session.speaker}</td>
      <td data-label="Time" className="px-6 py-4 text-muted font-mono text-sm">
        {formatTime(session.startTime)} – {formatTime(session.endTime)}
      </td>
      <td data-label="Location" className="px-6 py-4 text-muted">{session.location}</td>
    </tr>
  ))}
</tbody>
      </ResponsiveTable>
    </div>
  </AdminLayout>
)

export default AdminSchedule