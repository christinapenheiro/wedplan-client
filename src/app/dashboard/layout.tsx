// "use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";
// import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboard-shell";
import { IAccountRole } from "@/lib/types";



export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}



export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
//   const router = useRouter();
  const session = await getServerSession();

   if (!session) {
     redirect("/sign-in");
   }

   const rawRole = (
     session.user as {
       accountType?: IAccountRole;
     }
   ).accountType?.toLowerCase();

   return (
     <DashboardShell
       accountName={rawRole || "customer"}
       roleName={session?.user?.role || "user"}
       userName={session?.user?.name || session?.user?.email}
     >
       {children}
     </DashboardShell>
   );
}
