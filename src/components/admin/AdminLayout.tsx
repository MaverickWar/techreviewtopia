
import { ReactNode } from "react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  Menu,
  LogOut,
  FileStack,
  HomeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AdminLayoutProps {
  children?: ReactNode;
}

const sidebarItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    path: "/admin/content",
    label: "Content",
    icon: FileText
  },
  {
    path: "/admin/pages",
    label: "Pages",
    icon: FileStack
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: Users
  }
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && <h1 className="text-xl font-bold">Admin</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-slate-800"
          >
            {collapsed ? <Menu /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-2 space-y-2">
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors w-full text-gray-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <HomeIcon className="h-5 w-5" />
            {!collapsed && <span>Return to Website</span>}
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="min-h-screen bg-background">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};
