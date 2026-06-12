import React from "react";
import SideMenu from "@/components/side-menu";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <SideMenu />
      <main className="h-screen min-w-0 flex-1 overflow-hidden bg-primary/10 p-4">
        <div className="h-full min-w-0 overflow-x-hidden rounded-2xl bg-gray-50 p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
