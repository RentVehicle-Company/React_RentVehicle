import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import DashboardOverview from '../../components/admin/DashboardOverview'

export default function DashboardOverviewPage() {
  return (
    <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-x-auto">
            <DashboardOverview />
          </main>
        </div>
  )
}
