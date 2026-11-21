"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { clientApi } from "@/lib/api/clientApi";
import {
  Search,
  Ban,
  CheckCircle2,
  Eye,
  RefreshCw,
  Users,
  Shield,
  Store,
  User,
  Crown,
  Calendar,
  Building2,
  AlertCircle,
  Inbox,
  Loader2,
  X,
} from "lucide-react";

export interface IAdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  accountType?: "customer" | "vendor" | string;
  role?: "admin" | "user" | string;
  businessName?: string;
  subscriptionPlan?: "free" | "premium" | string;
  subscriptionExpiresAt?: string | Date;
  isBlocked?: boolean;
  banned?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

type RoleFilter = "all" | "customer" | "vendor" | "admin" | "blocked";

/** Resolves the display role from session metadata. */
function getUserRole(u: IAdminUser): "Admin" | "Vendor" | "Customer" {
  if (u.role?.toLowerCase() === "admin") return "Admin";
  if (u.accountType?.toLowerCase() === "vendor") return "Vendor";
  return "Customer";
}

/** Determines if user is blocked or suspended. */
function isUserBlocked(u: IAdminUser): boolean {
  return Boolean(u.isBlocked || u.banned);
}

/** Formats uppercase initials for user avatar fallback. */
function getInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "WP";
}

/** Formats date into a short readable string (e.g. "Nov 21, 2026"). */
function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AdminManageUsersPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;
  const currentAdminId = session?.user?.id;

  const [users, setUsers] = React.useState<IAdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [reloadKey, setReloadKey] = React.useState(0);

  // User details modal state
  const [selectedUser, setSelectedUser] = React.useState<IAdminUser | null>(null);

  // In-flight blocking state tracking
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  /** Fetches users from the admin backend endpoint. */
  React.useEffect(() => {
    if (sessionLoading) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await clientApi.get<IAdminUser[]>("/users", token);
        if (cancelled) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load registered users.";
        setError(msg);
        toast.add({
          type: "error",
          title: "Could not load users",
          description: msg,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, token, reloadKey]);

  /** Blocks or unblocks a target user. */
  const handleToggleBlock = async (targetUser: IAdminUser) => {
    const userId = targetUser._id || targetUser.id;
    if (!userId) return;

    // Guard: Prevent admin from blocking themselves
    if (userId === currentAdminId) {
      toast.add({
        type: "warning",
        title: "Action Not Permitted",
        description: "You cannot block your own administrative account.",
      });
      return;
    }

    const currentlyBlocked = isUserBlocked(targetUser);
    const newBlockState = !currentlyBlocked;

    setUpdatingUserId(userId);

    try {
      await clientApi.put(`/users/${userId}/block`, token || "", {
        isBlocked: newBlockState,
      });

      // Update in local state
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u._id || u.id;
          if (uId === userId) {
            return {
              ...u,
              isBlocked: newBlockState,
              banned: newBlockState,
            };
          }
          return u;
        })
      );

      // If the selected user modal is open for this user, sync its state
      if (selectedUser && (selectedUser._id || selectedUser.id) === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                isBlocked: newBlockState,
                banned: newBlockState,
              }
            : null
        );
      }

      toast.add({
        type: newBlockState ? "warning" : "success",
        title: newBlockState ? "User Blocked" : "User Unblocked",
        description: `${targetUser.name || "User"} has been ${
          newBlockState ? "blocked from platform access" : "restored to active status"
        }.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update user block status.";
      toast.add({
        type: "error",
        title: "Action Failed",
        description: msg,
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Compute live counts for role filters
  const counts = React.useMemo(() => {
    let customer = 0;
    let vendor = 0;
    let admin = 0;
    let blocked = 0;

    for (const u of users) {
      if (isUserBlocked(u)) blocked++;
      const role = getUserRole(u);
      if (role === "Customer") customer++;
      else if (role === "Vendor") vendor++;
      else if (role === "Admin") admin++;
    }

    return { total: users.length, customer, vendor, admin, blocked };
  }, [users]);

  // Apply search term and role filter
  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter((u) => {
      // 1. Role / Status Filter
      if (roleFilter === "blocked") {
        if (!isUserBlocked(u)) return false;
      } else if (roleFilter !== "all") {
        const role = getUserRole(u).toLowerCase();
        if (role !== roleFilter) return false;
      }

      // 2. Search query filter (name, email, businessName)
      if (term) {
        const matchesName = u.name?.toLowerCase().includes(term);
        const matchesEmail = u.email?.toLowerCase().includes(term);
        const matchesBusiness = u.businessName?.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesBusiness) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header with Search and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Users
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Directory of all registered couples, wedding planners, and verified vendors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="gap-2 h-9 border-border text-foreground hover:bg-muted"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs border-border"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              roleFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Users ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("customer")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              roleFilter === "customer"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
            }`}
          >
            <User className="size-3" />
            Customers ({counts.customer})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("vendor")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              roleFilter === "vendor"
                ? "bg-[#99616E] text-white shadow-xs"
                : "bg-[#99616E]/10 text-[#99616E] border border-[#99616E]/20 hover:bg-[#99616E]/20"
            }`}
          >
            <Store className="size-3" />
            Vendors ({counts.vendor})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              roleFilter === "admin"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
            }`}
          >
            <Shield className="size-3" />
            Admins ({counts.admin})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("blocked")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              roleFilter === "blocked"
                ? "bg-destructive text-destructive-foreground shadow-xs"
                : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
            }`}
          >
            <Ban className="size-3" />
            Blocked ({counts.blocked})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="size-10 text-destructive" />
            <h3 className="text-base font-semibold text-foreground">
              Unable to load user directory
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-2 gap-2"
            >
              <RefreshCw className="size-3.5" />
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Inbox className="size-8" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No users found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm
                ? `No accounts matched your search for "${searchTerm}".`
                : `There are currently no users registered under this filter.`}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase text-muted-foreground font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const userId = user._id || user.id || "";
                    const role = getUserRole(user);
                    const blocked = isUserBlocked(user);
                    const isSelf = userId === currentAdminId;
                    const isUpdating = updatingUserId === userId;

                    return (
                      <tr
                        key={userId}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {/* User Identity Column */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-border shrink-0">
                              {user.image && (
                                <AvatarImage
                                  src={user.image}
                                  alt={user.name || "User photo"}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-foreground text-sm truncate">
                                  {user.name || "Unnamed User"}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </div>
                              {user.businessName && (
                                <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                                  <Building2 className="size-3 text-primary/70 shrink-0" />
                                  <span>{user.businessName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              role === "Vendor"
                                ? "bg-[#99616E]/10 text-[#99616E] border-[#99616E]/20"
                                : role === "Admin"
                                ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {role === "Vendor" ? (
                              <Store className="size-3" />
                            ) : role === "Admin" ? (
                              <Shield className="size-3" />
                            ) : (
                              <User className="size-3" />
                            )}
                            {role}
                          </span>
                        </td>

                        {/* Joined Date Column */}
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              blocked
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {blocked ? (
                              <>
                                <Ban className="size-3" />
                                Blocked
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3" />
                                Active
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details Button */}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedUser(user)}
                              className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                              title="View full user details"
                            >
                              <Eye className="size-3.5" />
                              <span>Details</span>
                            </Button>

                            {/* Block / Unblock Action Button */}
                            <Button
                              variant="outline"
                              size="xs"
                              disabled={isSelf || isUpdating}
                              onClick={() => handleToggleBlock(user)}
                              className={`gap-1 h-7 text-xs font-medium ${
                                blocked
                                  ? "text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                                  : "text-destructive hover:bg-destructive/10 border-destructive/30"
                              }`}
                              title={
                                isSelf
                                  ? "You cannot block yourself"
                                  : blocked
                                  ? "Restore account access"
                                  : "Block user from platform"
                              }
                            >
                              {isUpdating ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : blocked ? (
                                <CheckCircle2 className="size-3" />
                              ) : (
                                <Ban className="size-3" />
                              )}
                              <span>{blocked ? "Unblock" : "Block"}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal (Dialog) */}
      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  User Profile Overview
                </DialogTitle>
                <DialogDescription>
                  Full account records and registration metadata
                </DialogDescription>
              </DialogHeader>

              {/* Modal Body */}
              <div className="space-y-4 pt-1">
                {/* User Header Profile */}
                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-muted/30 border border-border/80">
                  <Avatar className="size-14 border border-border shrink-0">
                    {selectedUser.image && (
                      <AvatarImage
                        src={selectedUser.image}
                        alt={selectedUser.name || "User photo"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      {selectedUser.name || "Unnamed User"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {getUserRole(selectedUser)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isUserBlocked(selectedUser)
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {isUserBlocked(selectedUser) ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Account Role */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Shield className="size-3 text-primary" />
                      Role
                    </span>
                    <p className="font-semibold text-foreground">
                      {getUserRole(selectedUser)}
                    </p>
                  </div>

                  {/* Joined Date */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-primary" />
                      Joined Date
                    </span>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>

                  {/* Business Name (for Vendors) */}
                  {selectedUser.businessName && (
                    <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Building2 className="size-3 text-primary" />
                        Business Name
                      </span>
                      <p className="font-semibold text-foreground">
                        {selectedUser.businessName}
                      </p>
                    </div>
                  )}

                  {/* Subscription Plan (if vendor or recorded) */}
                  {selectedUser.subscriptionPlan && (
                    <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Crown className="size-3 text-primary" />
                        Subscription Plan
                      </span>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground uppercase">
                          {selectedUser.subscriptionPlan} Plan
                        </p>
                        {selectedUser.subscriptionExpiresAt && (
                          <span className="text-[11px] text-muted-foreground">
                            Expires: {formatDate(selectedUser.subscriptionExpiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Identifier */}
                  <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Account ID
                    </span>
                    <p className="font-mono text-[11px] text-muted-foreground break-all">
                      {selectedUser._id || selectedUser.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Block / Unblock and Close */}
              <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-2 border-t border-border pt-3">
                <DialogClose render={<Button variant="outline" size="sm" />}>
                  Close
                </DialogClose>

                <Button
                  size="sm"
                  variant={isUserBlocked(selectedUser) ? "default" : "destructive"}
                  disabled={
                    (selectedUser._id || selectedUser.id) === currentAdminId ||
                    updatingUserId === (selectedUser._id || selectedUser.id)
                  }
                  onClick={() => handleToggleBlock(selectedUser)}
                  className="gap-1.5 text-xs h-8"
                >
                  {updatingUserId === (selectedUser._id || selectedUser.id) ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : isUserBlocked(selectedUser) ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <Ban className="size-3.5" />
                  )}
                  <span>
                    {isUserBlocked(selectedUser) ? "Unblock User" : "Block User"}
                  </span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
