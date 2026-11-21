"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function AdminManageServicesPage() {
  const [services, setServices] = React.useState([
    {
      id: "SRV-M1",
      title: "Full Day Cinematic Wedding Photography",
      vendor: "Lumiere Studios",
      category: "Photography",
      price: "$2,400",
      status: "approved",
    },
    {
      id: "SRV-M2",
      title: "Romantic Garden Floral Arch & Tablescapes",
      vendor: "Blush & Petal Co.",
      category: "Floral",
      price: "$1,850",
      status: "approved",
    },
    {
      id: "SRV-M3",
      title: "Boho Beachfront Ceremony Setup with Sound",
      vendor: "Coastal Moments",
      category: "Venue / Decor",
      price: "$3,100",
      status: "pending review",
    },
    {
      id: "SRV-M4",
      title: "Artisanal Wedding Cake Tasting Experience",
      vendor: "Sugar & Crumb Bakery",
      category: "Catering",
      price: "$450",
      status: "pending review",
    },
  ]);

  const setStatus = (id: string, newStatus: "approved" | "rejected") => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Services & Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Audit vendor service listings, package pricing, and directory standards
        </p>
      </div>

      <div className="space-y-3">
        {services.map((item) => (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{item.title}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : item.status === "rejected"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vendor: <strong className="text-foreground">{item.vendor}</strong> • Category: {item.category} • Base Price: <strong className="text-[#99616E]">{item.price}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status !== "approved" && (
                  <Button
                    size="xs"
                    onClick={() => setStatus(item.id, "approved")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <Check className="size-3.5" />
                    Approve
                  </Button>
                )}
                {item.status !== "rejected" && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setStatus(item.id, "rejected")}
                    className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-1"
                  >
                    <X className="size-3.5" />
                    Reject
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
