import React from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { NAVMENU_ITEMS } from "./constants";

const SideMenu = () => {
  const location = useLocation();
  const { user } = useAuth();
  const fullName = user?.name;
  const avatar = user?.avatar_url || "";

  return (
    <div className="h-screen w-[240px] shrink-0 bg-primary/10 p-6 pr-2 flex flex-col justify-between">
      <div className="space-y-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" className="h-12 w-12 object-contain" />
          <div>
            <h2 className="text-primary font-medium text-lg">tourtoise</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
        <ul className="space-y-1 w-full">
          {NAVMENU_ITEMS.map((item) => {
            const isActive =
              item.link === "/"
                ? location.pathname === item.link
                : location.pathname.startsWith(item.link);

            return (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center font-medium gap-3 px-4 py-3 w-full text-sm rounded-full transition-all
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-primary/75 hover:bg-primary/10 hover:text-primary"
                  }
                `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border border-primary/20 p-3 bg-white/50 rounded-xl flex items-center gap-2">
        <img
          src={getCloudinaryPreviewUrl(avatar, 120)}
          className="size-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="text-sm text-slate-800 font-medium">{fullName}</h2>
          <p className="text-xs text-slate-400">Super Admin</p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
