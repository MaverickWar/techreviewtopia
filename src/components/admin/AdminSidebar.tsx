
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Users,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: LayoutTemplate,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  }
];

export const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="h-screen w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-orange-600">Admin Panel</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-100 text-orange-600" 
                      : "text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        Admin Panel v1.0
      </div>
    </div>
  );
};
