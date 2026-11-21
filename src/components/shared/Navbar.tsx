"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  HeartHandshake,
  LayoutDashboard,
  UserPen,
  LogOut,
  Menu as MenuIcon,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

/**
 * Derives up to 2 uppercase initials from the user's name for avatar fallback display.
 * Handles single names, multi-part names, and missing name values gracefully.
 */
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Better Auth session state
  const { data: session, isPending } = authClient.useSession();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  /**
   * Dispatches Better Auth sign-out request, clears active session cookies,
   * and redirects user to the sign-in page upon completion.
   */
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Helper to determine whether a given route matches the current browser pathname.
   */
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Base navigation links always visible to visitors
  const publicNavLinks = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse-services" },
    { label: "About Us", href: "/about-us" },
  ];

  // Resolve role-based dashboard profile settings URL
  const userAccountType = (
    session?.user as { accountType?: string } | undefined
  )?.accountType?.toLowerCase();
  const userRole = (
    session?.user as { role?: string } | undefined
  )?.role?.toLowerCase();

  const profileSettingsUrl =
    userRole === "admin"
      ? "/dashboard/admin/profile-settings"
      : userAccountType === "vendor"
      ? "/dashboard/vendor/profile-settings"
      : "/dashboard/customer/profile-settings";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D2D3D0] dark:border-[#423940] bg-[#FAF8FA]/90 dark:bg-[#191417]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="flex items-center gap-2 group outline-none"
          aria-label="WedPlan Home"
        >
          <div className="size-9 rounded-full bg-[#C4B6D0]/30 border border-[#C4B6D0] flex items-center justify-center text-[#99616E] transition-transform duration-200 group-hover:scale-105">
            <HeartHandshake className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3]">
            Wed<span className="text-[#99616E]">Plan</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {publicNavLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-[#99616E] bg-[#99616E]/10 font-semibold"
                    : "text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3] hover:bg-[#F2EEF3]/60 dark:hover:bg-[#2E252C]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Conditional Dashboard Link for authenticated users */}
          {session && (
            <Link
              href="/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive("/dashboard")
                  ? "text-[#99616E] bg-[#99616E]/10 font-semibold"
                  : "text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3] hover:bg-[#F2EEF3]/60 dark:hover:bg-[#2E252C]"
              }`}
            >
              <LayoutDashboard className="size-4 text-[#99616E]" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Auth Action Buttons or User Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="flex items-center justify-center size-9">
              <Loader2 className="size-4 animate-spin text-[#99616E]" />
            </div>
          ) : session ? (
            /* Authenticated User Avatar & Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger
                className="group flex items-center gap-2 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99616E] cursor-pointer"
                aria-label="User Account Menu"
              >
                <Avatar className="size-9 border-2 border-[#C4B6D0] group-hover:border-[#99616E] transition-colors shadow-xs">
                  {session.user.image && (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User profile photo"}
                    />
                  )}
                  <AvatarFallback className="bg-[#C4B6D0]/30 text-[#99616E] font-bold text-xs">
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3.5 text-[#756770] group-hover:text-[#2A1F25] dark:group-hover:text-[#F5EFF3] transition-colors mr-1" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 p-2 bg-white/95 dark:bg-[#221B20]/95 backdrop-blur-md border-[#D2D3D0] dark:border-[#423940] shadow-xl shadow-[#C4B6D0]/20"
              >
                {/* User Identity Header */}
                <div className="flex items-center gap-3 p-2 bg-[#FAF8FA] dark:bg-[#191417] rounded-lg mb-1 border border-[#D2D3D0]/50 dark:border-[#423940]">
                  <Avatar className="size-10 border border-[#C4B6D0] shrink-0">
                    {session.user.image && (
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name || "Profile image"}
                      />
                    )}
                    <AvatarFallback className="bg-[#C4B6D0]/40 text-[#99616E] font-bold text-xs">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-[#2A1F25] dark:text-[#F5EFF3]">
                      {session.user.name || "Wedding Member"}
                    </span>
                    <span className="text-xs text-[#756770] dark:text-[#A797A2] truncate">
                      {session.user.email}
                    </span>
                    {(session.user as { role?: string })?.role && (
                      <span className="mt-0.5 inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#99616E]/10 text-[#99616E] w-fit">
                        {(session.user as { role?: string }).role}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-[#D2D3D0] dark:bg-[#423940] my-1" />

                {/* Dashboard Option */}
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#2A1F25] dark:text-[#F5EFF3] hover:text-[#99616E] hover:bg-[#99616E]/5 rounded-lg transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="size-4 text-[#99616E]" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                {/* Update Option */}
                <DropdownMenuItem
                  onClick={() => router.push(profileSettingsUrl)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#2A1F25] dark:text-[#F5EFF3] hover:text-[#99616E] hover:bg-[#99616E]/5 rounded-lg transition-colors cursor-pointer"
                >
                  <UserPen className="size-4 text-[#99616E]" />
                  <span>Update Profile</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#D2D3D0] dark:bg-[#423940] my-1" />

                {/* Sign Out Option */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                >
                  {isSigningOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Unauthenticated Visitor Options: Sign In & Sign Up */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/sign-in")}
                className="text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3] hover:bg-[#F2EEF3] dark:hover:bg-[#2E252C]"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/sign-up")}
                className="bg-[#99616E] hover:bg-[#824E5B] text-white shadow-sm transition-all"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3]"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D2D3D0] dark:border-[#423940] bg-[#FAF8FA] dark:bg-[#191417] px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile Public Navigation Links */}
          <div className="flex flex-col space-y-1">
            {publicNavLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-[#99616E] bg-[#99616E]/10 font-semibold"
                      : "text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3] hover:bg-[#F2EEF3]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Dashboard Link when authenticated */}
            {session && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive("/dashboard")
                    ? "text-[#99616E] bg-[#99616E]/10 font-semibold"
                    : "text-[#756770] hover:text-[#2A1F25] dark:text-[#A797A2] dark:hover:text-[#F5EFF3] hover:bg-[#F2EEF3]"
                }`}
              >
                <LayoutDashboard className="size-4 text-[#99616E]" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-[#D2D3D0] dark:border-[#423940]">
            {session ? (
              /* Mobile User Details & Actions */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-[#221B20] border border-[#D2D3D0]/60 dark:border-[#423940]">
                  <Avatar className="size-10 border border-[#C4B6D0]">
                    {session.user.image && (
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name || "Profile image"}
                      />
                    )}
                    <AvatarFallback className="bg-[#C4B6D0]/40 text-[#99616E] font-bold text-xs">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-[#2A1F25] dark:text-[#F5EFF3]">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-[#756770] dark:text-[#A797A2] truncate">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href={profileSettingsUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#756770] hover:text-[#99616E] hover:bg-[#F2EEF3]"
                  >
                    <UserPen className="size-4 text-[#99616E]" />
                    <span>Update Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                  >
                    {isSigningOut ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Mobile Unauthenticated Sign In / Sign Up */
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="outline"
                  className="w-full border-[#D2D3D0] dark:border-[#423940] text-[#2A1F25] dark:text-[#F5EFF3]"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-[#99616E] hover:bg-[#824E5B] text-white"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
