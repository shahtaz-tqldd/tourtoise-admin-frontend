import React from "react";
import SideMenu from "@/components/side-menu";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex">
      <SideMenu />
      <main className="flex-1 w-full bg-primary/15 h-screen p-4">
        <div className="bg-gray-50 p-8 rounded-2xl h-full custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
