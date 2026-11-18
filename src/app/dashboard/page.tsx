"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * Acts as the role-based gateway for the root /dashboard route.
 * Inspects the current user session role and immediately redirects
 * the user to their corresponding role overview page:
 * - Admin -> /dashboard/admin
 * - Vendor -> /dashboard/vendor
 * - Customer -> /dashboard/customer
 */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/sign-in");
        return;
      }

      const role = (session.user as { role?: string })?.role?.toLowerCase();
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "vendor") {
        router.replace("/dashboard/vendor");
      } else {
        router.replace("/dashboard/customer");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[#99616E]" />
        <p className="text-sm">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
