"use client";

import { DashboardSidebar } from "../organisms/dashboard/DashboardSidebar";
import { DashboardNavbar } from "../organisms/dashboard/DashboardNavbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#8D9999_1px,transparent_2px)] [background-size:32px_32px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[40%] rounded-full bg-neon/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[10%] rounded-full bg-azure/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <DashboardNavbar />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
