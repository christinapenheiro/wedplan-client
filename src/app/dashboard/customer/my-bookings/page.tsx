"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CalendarHeart,
  Mail,
  MapPin,
  Compass,
} from "lucide-react";

export default function CustomerMyBookingsPage() {
  const bookings = [
    {
      id: "BK-801",
      vendor: "Meadow View Estate",
      service: "Grand Lawn & Pavilion (Full Day Rental)",
      contact: "events@meadowview.com",
      location: "Hudson Valley, NY",
      date: "Saturday, Oct 14, 2026",
      status: "Confirmed",
      paid: "$6,500 (Paid in Full)",
    },
    {
      id: "BK-802",
      vendor: "Lumiere Film Studios",
      service: "Cinematic Photography & Drone Footage",
      contact: "hello@lumiere.com",
      location: "New York, NY",
      date: "Saturday, Oct 14, 2026",
      status: "Deposit Paid",
      paid: "$1,400 Deposit of $2,800",
    },
    {
      id: "BK-803",
      vendor: "Blush & Petal Co.",
      service: "Aisle Runner, Arch, & 12 Centerpieces",
      contact: "orders@blushpetal.com",
      location: "Brooklyn, NY",
      date: "Saturday, Oct 14, 2026",
      status: "Reviewing Quote",
      paid: "$0 (Pending Approval)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all your booked wedding services, venues, and vendors
          </p>
        </div>
        <Link
          href="/browse"
          className={buttonVariants({ variant: "default" }) + " bg-[#99616E] hover:bg-[#824E5B] text-white gap-2"}
        >
          <Compass className="size-4" />
          <span>Discover More Vendors</span>
        </Link>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="border-border">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarHeart className="size-4.5 text-[#99616E]" />
                  <CardTitle className="text-base font-bold">
                    {booking.vendor}
                  </CardTitle>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      booking.status === "Confirmed"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : booking.status === "Deposit Paid"
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {booking.service}
                </CardDescription>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-semibold text-foreground">
                  {booking.paid}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Date: {booking.date}
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0 border-t border-border mt-1 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#99616E]" />
                  {booking.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5 text-[#99616E]" />
                  {booking.contact}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs">
                  View Contract
                </Button>
                <Button variant="outline" size="xs" className="text-[#99616E] border-[#C4B6D0]">
                  Contact Vendor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
