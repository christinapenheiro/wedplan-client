"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Crown,
  DollarSign,
  Calendar,
  Building2,
  Lock,
  Inbox,
  AlertCircle,
  ShieldCheck,
  X,
  CreditCard,
} from "lucide-react";

export interface IAdminTransaction {
  _id: string;
  id?: string;
  userId?: string;
  userEmail?: string;
  vendorName?: string | null;
  vendorBusinessName?: string | null;
  vendorImage?: string | null;
  amount: number;
  currency?: string;
  plan?: string;
  status: "paid" | "unpaid" | "failed" | string;
  createdAt: string | Date;
  paidAt?: string | Date | null;
  subscriptionExpiresAt?: string | Date | null;
  sessionId?: string | null;
  paymentIntent?: string | null;
}

type StatusFilter = "all" | "paid" | "unpaid" | "failed";

/** Formats a numeric amount with currency code (e.g. $99.00 USD). */
function formatCurrency(amount: number, currency = "usd"): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Formats uppercase initials for vendor avatar fallback. */
function getInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "VN";
}

/** Formats date into readable string with time (e.g. "Nov 21, 2026, 4:32 PM"). */
function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Formats date into a short date string (e.g. "Nov 21, 2026"). */
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

/** Visual metadata for transaction payment status. */
function getStatusMeta(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed" || s === "success") {
    return {
      label: "Paid",
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    };
  }

  if (s === "failed" || s === "cancelled") {
    return {
      label: "Failed",
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  return {
    label: "Unpaid",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  };
}

export default function AdminTransactionsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;

  const [transactions, setTransactions] = React.useState<IAdminTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [reloadKey, setReloadKey] = React.useState(0);

  // Transaction details modal state
  const [selectedTx, setSelectedTx] = React.useState<IAdminTransaction | null>(null);

  /** Fetches all payment transaction records from the backend. */
  React.useEffect(() => {
    if (sessionLoading) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await clientApi.get<IAdminTransaction[]>(
          "/transactions",
          token
        );
        if (cancelled) return;
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load platform transaction records.";
        setError(msg);
        toast.add({
          type: "error",
          title: "Could not load transactions",
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

  // Derived financial statistics
  const stats = React.useMemo(() => {
    let totalRevenue = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let failedCount = 0;

    for (const tx of transactions) {
      const s = tx.status?.toLowerCase();
      if (s === "paid" || s === "completed" || s === "success") {
        totalRevenue += tx.amount || 0;
        paidCount++;
      } else if (s === "failed" || s === "cancelled") {
        failedCount++;
      } else {
        unpaidCount++;
      }
    }

    return {
      totalRevenue,
      paidCount,
      unpaidCount,
      failedCount,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // Filtered transactions by search query and payment status
  const filteredTransactions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return transactions.filter((tx) => {
      // 1. Status Filter
      if (statusFilter !== "all") {
        const s = tx.status?.toLowerCase();
        if (statusFilter === "paid" && s !== "paid" && s !== "completed") {
          return false;
        }
        if (statusFilter === "unpaid" && s !== "unpaid") {
          return false;
        }
        if (statusFilter === "failed" && s !== "failed" && s !== "cancelled") {
          return false;
        }
      }

      // 2. Search query filter (Vendor Name, Email, Business Name, Session ID, Tx ID)
      if (term) {
        const txId = (tx._id || tx.id || "").toLowerCase();
        const vendorName = tx.vendorName?.toLowerCase() || "";
        const email = tx.userEmail?.toLowerCase() || "";
        const businessName = tx.vendorBusinessName?.toLowerCase() || "";
        const sessionId = tx.sessionId?.toLowerCase() || "";

        if (
          !txId.includes(term) &&
          !vendorName.includes(term) &&
          !email.includes(term) &&
          !businessName.includes(term) &&
          !sessionId.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchTerm, statusFilter]);

  /** Exports current filtered transactions to a CSV file. */
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.add({
        type: "warning",
        title: "No Data",
        description: "There are no transactions to export under the current filter.",
      });
      return;
    }

    const headers = [
      "Transaction ID",
      "Vendor Name",
      "Vendor Email",
      "Business Name",
      "Plan",
      "Amount",
      "Currency",
      "Status",
      "Created At",
      "Paid At",
      "Stripe Session ID",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx._id || tx.id || ""}"`,
      `"${tx.vendorName || ""}"`,
      `"${tx.userEmail || ""}"`,
      `"${tx.vendorBusinessName || ""}"`,
      `"${tx.plan || "premium"}"`,
      tx.amount,
      `"${tx.currency || "usd"}"`,
      `"${tx.status || "unpaid"}"`,
      `"${formatDate(tx.createdAt)}"`,
      `"${formatDate(tx.paidAt)}"`,
      `"${tx.sessionId || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `wedplan-transactions-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.add({
      type: "success",
      title: "Export Successful",
      description: `Downloaded ${filteredTransactions.length} transaction records.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="size-6 text-[#99616E]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform Transactions & Payouts
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit vendor subscription payments and Stripe settlement records
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || transactions.length === 0}
            className="gap-2 h-9 border-border text-foreground hover:bg-muted"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Security Notice: Read-only Audit Log Guarantee */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground">
        <Lock className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-primary">
            Immutable Financial Audit Log
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All transaction statuses are automatically determined by Stripe payment
            events and webhook confirmations. In compliance with financial audit rules,
            manual modifications to mark unsuccessful payments as successful are
            strictly disabled.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Gross Subscription Revenue
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed Stripe payments
            </p>
          </CardContent>
        </Card>

        {/* Successful Payments */}
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Successful Payments
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.paidCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Activated vendor subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Unpaid / Checkout Incomplete */}
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Unpaid / In Progress
              </span>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.unpaidCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions awaiting checkout
            </p>
          </CardContent>
        </Card>

        {/* Failed Sessions */}
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Failed Payments
              </span>
              <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <XCircle className="size-4" />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.failedCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cancelled or declined transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor, email, session ID..."
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All ({stats.totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="size-3" />
            Paid ({stats.paidCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("unpaid")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === "unpaid"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            <Clock className="size-3" />
            Unpaid ({stats.unpaidCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("failed")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === "failed"
                ? "bg-destructive text-destructive-foreground shadow-xs"
                : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
            }`}
          >
            <XCircle className="size-3" />
            Failed ({stats.failedCount})
          </button>
        </div>
      </div>

      {/* Main Transactions Table */}
      {loading ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-7 w-16" />
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
              Unable to load transactions
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
      ) : filteredTransactions.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Inbox className="size-8" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No transactions found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm
                ? `No transactions matched your search query "${searchTerm}".`
                : `There are currently no transactions under this filter.`}
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
                    <th className="px-4 py-3">Vendor Information</th>
                    <th className="px-4 py-3">Subscription Plan</th>
                    <th className="px-4 py-3">Payment Amount</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Transaction Date</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((tx) => {
                    const txId = tx._id || tx.id || "";
                    const statusMeta = getStatusMeta(tx.status || "unpaid");
                    const StatusIcon = statusMeta.icon;

                    const vendorDisplayName =
                      tx.vendorName ||
                      tx.vendorBusinessName ||
                      "Registered Vendor";
                    const vendorEmail = tx.userEmail || "No email available";

                    return (
                      <tr
                        key={txId}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {/* 1. Vendor Information */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-border shrink-0">
                              {tx.vendorImage && (
                                <AvatarImage
                                  src={tx.vendorImage}
                                  alt={vendorDisplayName}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                                {getInitials(vendorDisplayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">
                                {vendorDisplayName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {vendorEmail}
                              </p>
                              {tx.vendorBusinessName &&
                                tx.vendorBusinessName !== vendorDisplayName && (
                                  <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                                    <Building2 className="size-3 text-primary/70 shrink-0" />
                                    <span>{tx.vendorBusinessName}</span>
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Subscription Plan */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Crown className="size-3.5 text-amber-500 shrink-0" />
                            <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                              {tx.plan || "Premium"}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            90-Day Full Access
                          </span>
                        </td>

                        {/* 3. Payment Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-sm text-foreground">
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase ml-1">
                            {tx.currency || "USD"}
                          </span>
                        </td>

                        {/* 4. Payment Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.className}`}
                          >
                            <StatusIcon className="size-3" />
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* 5. Transaction Date */}
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(tx.paidAt || tx.createdAt)}
                        </td>

                        {/* Actions (Audit Details Only - Manual Edit Disabled) */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSelectedTx(tx)}
                            className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                            title="Inspect immutable audit record"
                          >
                            <Eye className="size-3.5" />
                            <span>Audit</span>
                          </Button>
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

      {/* Transaction Audit Details Modal (Dialog) */}
      <Dialog
        open={Boolean(selectedTx)}
        onOpenChange={(open) => {
          if (!open) setSelectedTx(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selectedTx && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="size-4 text-primary" />
                  Transaction Audit Record
                </DialogTitle>
                <DialogDescription>
                  Verified payment record recorded via Stripe Checkout
                </DialogDescription>
              </DialogHeader>

              {/* Modal Body */}
              <div className="space-y-4 pt-1">
                {/* Status & Amount Banner */}
                <div className="p-3.5 rounded-lg bg-muted/30 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block">
                      Total Billed
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(selectedTx.amount, selectedTx.currency)}
                    </span>
                  </div>

                  {(() => {
                    const meta = getStatusMeta(selectedTx.status || "unpaid");
                    const Icon = meta.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border ${meta.className}`}
                      >
                        <Icon className="size-3.5" />
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Audit Attributes Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Vendor Identity */}
                  <div className="col-span-2 p-3 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="size-3 text-primary" />
                      Vendor Identity
                    </span>
                    <p className="font-semibold text-foreground text-sm">
                      {selectedTx.vendorName ||
                        selectedTx.vendorBusinessName ||
                        "Vendor"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTx.userEmail}
                    </p>
                    {selectedTx.vendorBusinessName && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Studio / Company: {selectedTx.vendorBusinessName}
                      </p>
                    )}
                  </div>

                  {/* Subscription Plan */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Crown className="size-3 text-primary" />
                      Plan
                    </span>
                    <p className="font-semibold text-foreground uppercase">
                      {selectedTx.plan || "Premium"}
                    </p>
                    <span className="text-[11px] text-muted-foreground block">
                      90-Day Access
                    </span>
                  </div>

                  {/* Payment Method / Mode */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <CreditCard className="size-3 text-primary" />
                      Payment Gateway
                    </span>
                    <p className="font-semibold text-foreground">
                      Stripe Checkout
                    </p>
                    <span className="text-[11px] text-muted-foreground block">
                      Secure Card Processing
                    </span>
                  </div>

                  {/* Created At */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-primary" />
                      Initiated Date
                    </span>
                    <p className="font-semibold text-foreground">
                      {formatDateTime(selectedTx.createdAt)}
                    </p>
                  </div>

                  {/* Paid At */}
                  <div className="p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-primary" />
                      Confirmed Date
                    </span>
                    <p className="font-semibold text-foreground">
                      {selectedTx.paidAt
                        ? formatDateTime(selectedTx.paidAt)
                        : "Awaiting confirmation"}
                    </p>
                  </div>

                  {/* Subscription Expiration */}
                  {selectedTx.subscriptionExpiresAt && (
                    <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-primary" />
                        Subscription Valid Through
                      </span>
                      <p className="font-semibold text-foreground">
                        {formatDate(selectedTx.subscriptionExpiresAt)}
                      </p>
                    </div>
                  )}

                  {/* Stripe Session Reference */}
                  {selectedTx.sessionId && (
                    <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-0.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Stripe Session ID
                      </span>
                      <p className="font-mono text-[11px] text-muted-foreground break-all">
                        {selectedTx.sessionId}
                      </p>
                    </div>
                  )}

                  {/* Database Identifier */}
                  <div className="col-span-2 p-2.5 rounded-md bg-muted/20 border border-border/60 space-y-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Internal Record ID
                    </span>
                    <p className="font-mono text-[11px] text-muted-foreground break-all">
                      {selectedTx._id || selectedTx.id}
                    </p>
                  </div>
                </div>

                {/* Audit Integrity Footer Note */}
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/40 text-[11px] text-muted-foreground border border-border/40">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    Immutable record verified via Stripe webhook signature. Manual status alteration is disabled.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2 border-t border-border pt-3">
                <DialogClose render={<Button variant="outline" size="sm" />}>
                  Close
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
