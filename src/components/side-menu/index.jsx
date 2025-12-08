import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  LineChart,
  MessageSquare,
  Shield,
  Store,
  Tags,
  Settings,
} from "lucide-react";
// import logo from "@/assets/images/logo.svg";

const SideMenu = () => {
  const location = useLocation();

  const navItems = [
    {
      id: 1,
      label: "Overview",
      link: "/",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 2,
      label: "Customers",
      link: "/customers",
      icon: <Users size={18} />,
    },
    {
      id: 3,
      label: "Products",
      link: "/products",
      icon: <Package size={18} />,
    },
    {
      id: 4,
      label: "Orders",
      link: "/orders",
      icon: <ShoppingBag size={18} />,
    },
    { id: 5, label: "Sales", link: "/sales", icon: <LineChart size={18} /> },
    {
      id: 6,
      label: "Messages",
      link: "/messages",
      icon: <MessageSquare size={18} />,
    },
    { id: 9, label: "Coupons", link: "/coupons", icon: <Tags size={18} /> },
    {
      id: 7,
      label: "Roles & Permissions",
      link: "/roles-and-permissions",
      icon: <Shield size={18} />,
    },
    
    // 💡 Additional eCommerce admin suggested:
    { id: 8, label: "Storefront", link: "/store", icon: <Store size={18} /> },
    {
      id: 10,
      label: "Account Settings",
      link: "/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="max-w-[240px] w-full h-screen bg-primary/15 p-6 pr-2 flex flex-col justify-between">
      <div className="space-y-6">
        <Link to="/" className="flex items-center">
          {/* <img src={logo} className="h-11 w-11" /> */}
          <h2 className="text-primary font-medium">tourtoise admin</h2>
        </Link>
        <ul className="space-y-1 w-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.link;

            return (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-2 w-full text-sm rounded-md transition-all
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-primary/75 hover:bg-primary/15 hover:text-primary"
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

      <div className="bg-primary/10 p-3 rounded-lg flex items-center gap-2">
        <img
          src="https://media.licdn.com/dms/image/v2/D5603AQFNKfEBpcynJw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722787149506?e=2147483647&v=beta&t=snYVYV9rYKnqQVnkWUAjtnQO1n_d6auaquNfuSvT3fg"
          className="h-9 w-9 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-sm text-primary font-medium">Shahtaz Rahman</h2>
          <p className="text-xs text-primary/75">Store Admin</p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
