
import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

interface AdminLayoutProps {
  children: ReactNode;
}

export const NewAdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
      <Toaster />
    </div>
  );
};
