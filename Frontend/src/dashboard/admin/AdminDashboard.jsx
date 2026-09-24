import React from 'react'
import StatGrid from "@/components/ui/StatGrid"
import { dashboardStats } from "@/data/mockData"
import AdminLayout from "@/dashboard/layouts/AdminLayout"
import BoothTrafficChart from './BoothTrafficChart'
import StatCard from '../StatCard'

const AdminDashboard = () => (
  <AdminLayout>
    <div className="p-4 md:p-8">
      <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
        Admin Dashboard
      </h1>
      <p className="text-muted mb-6 text-sm md:text-base">Manage your expos, exhibitors, and schedules.</p>

      <StatGrid>
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </StatGrid>

      <div className="mt-6">
        <BoothTrafficChart />
      </div>
    </div>
  </AdminLayout>
)

export default AdminDashboard