import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ManageVehicles from "../../components/admin/ManageVehicles";

export default function ManageVehiclesPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto">
        <ManageVehicles />
      </main>
    </div>
  );
}