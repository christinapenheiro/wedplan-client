"use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { IAccountRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Guard dashboard routes against unauthenticated access
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-[#99616E]" />
          <p className="text-sm text-muted-foreground">Loading dashboard workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const rawRole = (session?.user as { role?: IAccountRole } | undefined)?.role;
  const roleName = rawRole || "Customer";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 bg-background min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6 bg-background/80 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground capitalize">{roleName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-muted-foreground">
              Signed in as <strong className="text-foreground">{session.user.name || session.user.email}</strong>
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
