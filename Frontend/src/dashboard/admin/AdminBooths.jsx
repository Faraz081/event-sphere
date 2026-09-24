import React from 'react'
import AdminLayout from "@/dashboard/layouts/AdminLayout"
import ResponsiveTable from "@/components/ui/ResponsiveTable"
import { mockBooths } from "@/data/mockData"

const statusStyles = {
  available: "bg-gold/30 text-gold-100",
  reserved: "bg-emerald/30 text-emerald-300",
  occupied: "bg-muted/30 text-muted-100",
}
const AdminBooths = () => (
  <AdminLayout>
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
          Booths
        </h1>
        <p className="text-muted text-sm md:text-base">Manage booth allocations across your expos.</p>
      </div>

      <ResponsiveTable>
        <thead className="border-b border-border">
          <tr>
            <th className="px-6 py-3 text-sm text-muted font-medium">Booth #</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Expo</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Exhibitor</th>
            <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
  {mockBooths.map((booth) => (
    <tr key={booth.id} className="border-b border-border last:border-0">
      <td data-label="Booth #" className="px-6 py-4 text-foreground font-mono font-medium">{booth.boothNumber}</td>
      <td data-label="Expo" className="px-6 py-4 text-muted">{booth.expoTitle}</td>
      <td data-label="Exhibitor" className="px-6 py-4 text-muted">{booth.exhibitor ?? "—"}</td>
      <td data-label="Status" className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[booth.status]}`}>
          {booth.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>
      </ResponsiveTable>
    </div>
  </AdminLayout>
)

export default AdminBooths