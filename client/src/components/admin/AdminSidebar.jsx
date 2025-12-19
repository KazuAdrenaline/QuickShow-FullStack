import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
  SettingsIcon,
} from "lucide-react";

import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const AdminSidebar = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const adminNavlinks = [
    { name: "Bảng điều khiển", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Thêm suất chiếu", path: "/admin/add-shows", icon: PlusSquareIcon },
    { name: "Danh sách suất chiếu", path: "/admin/list-shows", icon: ListIcon },
    { name: "Danh sách đặt vé", path: "/admin/list-bookings", icon: ListCollapseIcon },
    { name: "Cài đặt hệ thống", path: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 bg-gray-900 text-sm">

      {/* Avatar */}
      <img
        className="h-10 md:h-14 w-10 md:w-14 rounded-full mx-auto object-cover border border-gray-700"
        src={user.imageUrl}
        alt="profile"
      />

      <p className="mt-2 text-base max-md:hidden text-white font-medium">
        {user.firstName} {user.lastName}
      </p>

      {/* NAV */}
      <div className="w-full mt-6">
        {adminNavlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 pl-10 text-gray-400 hover:text-white transition-all ${
                isActive ? "bg-primary/20 text-primary font-semibold" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="w-5 h-5" />
                <p className="max-md:hidden">{link.name}</p>

                {/* Active indicator */}
                {isActive && (
                  <span className="w-1.5 h-10 bg-primary rounded-l absolute right-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
