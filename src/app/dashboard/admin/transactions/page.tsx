"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight } from "lucide-react";

export default function AdminTransactionsPage() {
  const transactions = [
    {
      id: "TX-9012",
      couple: "Eleanor & Liam Vance",
      vendor: "Meadow View Estate",
      amount: "$6,500.00",
      commission: "$650.00",
      date: "Nov 18, 2026",
      status: "Completed",
    },
    {
      id: "TX-9011",
      couple: "Sophia & Lucas Miller",
      vendor: "Lumiere Studios",
      amount: "$2,800.00",
      commission: "$280.00",
      date: "Nov 17, 2026",
      status: "Completed",
    },
    {
      id: "TX-9010",
      couple: "Mia & Noah Sterling",
      vendor: "Blush & Petal Co.",
      amount: "$1,650.00",
      commission: "$165.00",
      date: "Nov 16, 2026",
      status: "Processing",
    },
    {
      id: "TX-9009",
      couple: "Chloe & Oliver Davies",
      vendor: "Sugar & Crumb Bakery",
      amount: "$750.00",
      commission: "$75.00",
      date: "Nov 14, 2026",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Transactions & Payouts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit booking fees, platform commissions, and vendor settlement logs
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="size-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">30-Day Gross Volume</span>
            <div className="text-2xl font-bold mt-1 text-foreground">$11,700.00</div>
            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="size-3" /> +18.4% from last period
            </span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Platform Net Commission</span>
            <div className="text-2xl font-bold mt-1 text-[#99616E]">$1,170.00</div>
            <span className="text-xs text-muted-foreground mt-1 block">10% standard vendor fee</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Pending Settlements</span>
            <div className="text-2xl font-bold mt-1 text-amber-600">$1,650.00</div>
            <span className="text-xs text-muted-foreground mt-1 block">1 transaction in escrow</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Couple & Vendor</th>
                  <th className="px-4 py-3">Gross Amount</th>
                  <th className="px-4 py-3">Platform Fee (10%)</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{tx.couple}</div>
                      <div className="text-xs text-muted-foreground">To: {tx.vendor}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {tx.amount}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#99616E]">
                      {tx.commission}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          tx.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
