"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Mail,
  Users,
} from "lucide-react";

export default function VendorBookingRequestsPage() {
  const [requests, setRequests] = React.useState([
    {
      id: "REQ-201",
      couple: "Eleanor & Liam Vance",
      email: "eleanor@example.com",
      service: "Floral Arch & Tablescapes",
      date: "October 14, 2026",
      guestCount: "140 Guests",
      venue: "Meadow View Estate",
      status: "Pending",
      notes: "Looking for blush, berry, and eucalyptus florals for evening ceremony.",
    },
    {
      id: "REQ-202",
      couple: "Sophia & Lucas Miller",
      email: "sophia.m@example.com",
      service: "Full Day Photography & Drone",
      date: "November 02, 2026",
      guestCount: "90 Guests",
      venue: "Grand Pavilion",
      status: "Pending",
      notes: "Need coverage starting from bridal prep till sparkler exit.",
    },
    {
      id: "REQ-203",
      couple: "Mia & Noah Sterling",
      email: "mia.sterling@example.com",
      service: "Custom 3-Tier Berry Cake",
      date: "December 18, 2026",
      guestCount: "180 Guests",
      venue: "Starlight Ballroom",
      status: "Accepted",
      notes: "Tasting confirmed; gluten-free top tier required.",
    },
  ]);

  const updateStatus = (id: string, newStatus: "Accepted" | "Declined") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Booking Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review, accept, or decline booking inquiries submitted by engaged couples
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="border-border">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">
                    {req.couple}
                  </CardTitle>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      req.status === "Accepted"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : req.status === "Declined"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    {req.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {req.guestCount}
                  </span>
                </CardDescription>
              </div>

              {req.status === "Pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus(req.id, "Accepted")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs"
                  >
                    <Check className="size-3.5" />
                    <span>Accept</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(req.id, "Declined")}
                    className="text-destructive hover:bg-destructive/10 border-destructive/20 h-8 text-xs gap-1.5"
                  >
                    <X className="size-3.5" />
                    <span>Decline</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-2 border-t border-border mt-1 pt-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  Requested Service: <strong className="text-foreground">{req.service}</strong>
                </div>
                <div>
                  Wedding Date: <strong className="text-foreground">{req.date}</strong> ({req.venue})
                </div>
              </div>
              {req.notes && (
                <p className="p-2.5 rounded-md bg-muted/30 text-muted-foreground italic">
                  &ldquo;{req.notes}&rdquo;
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
