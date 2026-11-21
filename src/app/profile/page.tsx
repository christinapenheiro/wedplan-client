"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * Gateway route for /profile:
 * Inspects user role from session and immediately forwards them
 * to their corresponding dashboard profile settings page:
 * - Admin -> /dashboard/admin/profile-settings
 * - Vendor -> /dashboard/vendor/profile-settings
 * - Customer -> /dashboard/customer/profile-settings
 */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/sign-in");
        return;
      }

      const accountType = (
        session.user as { accountType?: string }
      )?.accountType?.toLowerCase();
      const role = (
        session.user as { role?: string }
      )?.role?.toLowerCase();

      if (role === "admin") {
        router.replace("/dashboard/admin/profile-settings");
      } else if (accountType === "vendor") {
        router.replace("/dashboard/vendor/profile-settings");
      } else {
        router.replace("/dashboard/customer/profile-settings");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[#99616E]" />
        <p className="text-sm">Redirecting to your profile settings...</p>
      </div>
    </div>
  );
}
