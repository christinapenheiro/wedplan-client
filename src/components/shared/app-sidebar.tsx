"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
  HeartHandshake,
  LayoutDashboard,
  PlusCircle,
  Store,
  CalendarCheck,
  CreditCard,
  CalendarHeart,
  UserCog,
  Users,
  Boxes,
  Receipt,
  LogOut,
  Home,
  Sparkles,
} from "lucide-react";

/**
 * Returns initials from a user's name for display in avatar fallbacks.
 */
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Role-specific navigation specifications.
 * Defines the navigation menu items for Vendor, Customer, and Admin dashboards.
 */
const VENDOR_NAV_ITEMS = [
  {
    title: "Dashboard overview",
    url: "/dashboard/vendor",
    icon: LayoutDashboard,
  },
  {
    title: "Add service",
    url: "/dashboard/vendor/add-service",
    icon: PlusCircle,
  },
  {
    title: "My Services",
    url: "/dashboard/vendor/my-services",
    icon: Store,
  },
  {
    title: "Booking Requests",
    url: "/dashboard/vendor/booking-requests",
    icon: CalendarCheck,
  },
  {
    title: "Subscription",
    url: "/dashboard/vendor/subscription",
    icon: CreditCard,
  },
];

const CUSTOMER_NAV_ITEMS = [
  {
    title: "Dashboard overview",
    url: "/dashboard/customer",
    icon: LayoutDashboard,
  },
  {
    title: "My bookings",
    url: "/dashboard/customer/my-bookings",
    icon: CalendarHeart,
  },
  {
    title: "Profile Settings",
    url: "/dashboard/customer/profile-settings",
    icon: UserCog,
  },
];

const ADMIN_NAV_ITEMS = [
  {
    title: "Overview",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Users",
    url: "/dashboard/admin/manage-users",
    icon: Users,
  },
  {
    title: "Manage Services",
    url: "/dashboard/admin/manage-services",
    icon: Boxes,
  },
  {
    title: "Transactions",
    url: "/dashboard/admin/transactions",
    icon: Receipt,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Normalize user role from session metadata, defaulting to Customer
  const rawRole = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const role: "vendor" | "customer" | "admin" =
    rawRole === "admin"
      ? "admin"
      : rawRole === "vendor"
      ? "vendor"
      : "customer";

  /**
   * Selects the navigation configuration that corresponds to the active user role.
   */
  const navItems = React.useMemo(() => {
    switch (role) {
      case "vendor":
        return VENDOR_NAV_ITEMS;
      case "admin":
        return ADMIN_NAV_ITEMS;
      case "customer":
      default:
        return CUSTOMER_NAV_ITEMS;
    }
  }, [role]);

  const roleMeta = React.useMemo(() => {
    switch (role) {
      case "vendor":
        return {
          label: "Vendor Portal",
          description: "Manage wedding services & bookings",
          badgeColor: "bg-[#99616E]/15 text-[#99616E] border-[#99616E]/30",
        };
      case "admin":
        return {
          label: "Admin Console",
          description: "Platform management & audits",
          badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
        };
      case "customer":
      default:
        return {
          label: "Customer Area",
          description: "Personal wedding planner",
          badgeColor: "bg-[#C4B6D0]/30 text-[#99616E] border-[#C4B6D0]",
        };
    }
  }, [role]);

  /**
   * Signs the user out of their session and redirects to the sign-in page.
   */
  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Sidebar Header with WedPlan branding and Role Badge */}
      <SidebarHeader className="border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group overflow-hidden"
            title="Return to website"
          >
            <div className="size-9 shrink-0 rounded-full bg-[#C4B6D0]/30 border border-[#C4B6D0] flex items-center justify-center text-[#99616E] transition-transform duration-200 group-hover:scale-105">
              <HeartHandshake className="size-5" />
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-base font-bold tracking-tight text-foreground truncate leading-none">
                Wed<span className="text-[#99616E]">Plan</span>
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 truncate">
                Wedding Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Role Portal Tag */}
        {/* <div className="mt-2.5 px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 group-data-[collapsible=icon]:hidden select-none w-fit tracking-wide shadow-2xs">
          <span className={`inline-block size-1.5 rounded-full ${role === "admin" ? "bg-purple-600" : "bg-[#99616E]"}`} />
          <span className="font-semibold">{roleMeta.label}</span>
        </div> */}
      </SidebarHeader>

      {/* Dynamic Navigation Content */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== `/dashboard/${role}` && pathname.startsWith(item.url));

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={`gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#99616E]/15 text-[#99616E] dark:bg-[#99616E]/25 font-semibold"
                          : "text-foreground hover:bg-[#F2EEF3] dark:hover:bg-[#2A2328] hover:text-[#99616E]"
                      }`}
                    >
                      <Icon
                        className={`size-4.5 shrink-0 ${
                          isActive ? "text-[#99616E]" : "text-muted-foreground"
                        }`}
                      />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        {/* General Application Links */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  tooltip="Back to Website"
                  className="gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-[#F2EEF3] dark:hover:bg-[#2A2328]"
                >
                  <Home className="size-4.5 shrink-0 text-muted-foreground" />
                  <span>Back to Website</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/browse" />}
                  tooltip="Browse Services"
                  className="gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-[#F2EEF3] dark:hover:bg-[#2A2328]"
                >
                  <Sparkles className="size-4.5 shrink-0 text-muted-foreground" />
                  <span>Browse Directory</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with User Details & Sign Out */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-lg p-2 bg-sidebar-accent/50 group-data-[collapsible=icon]:p-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8.5 shrink-0 border border-[#C4B6D0]">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
              )}
              <AvatarFallback className="bg-[#C4B6D0]/30 text-[#99616E] text-xs font-bold">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold truncate leading-tight text-foreground">
                {session?.user?.name || "WedPlan User"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate leading-tight">
                {session?.user?.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
