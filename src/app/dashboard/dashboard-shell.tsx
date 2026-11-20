"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";

interface DashboardShellProps {
  children: React.ReactNode;
  roleName: string;
  userName: string;
  accountName: string;
}

export default function DashboardShell({
  children,
  roleName,
  userName,
  accountName,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col flex-1 bg-background min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6 bg-background/80 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="capitalize">{`${roleName=== "admin" ? "Admin" : accountName}`}</span>
            </div>
          </div>

          <span className="hidden sm:inline-block text-xs text-muted-foreground">
            Signed in as <strong>{userName}</strong>
          </span>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
