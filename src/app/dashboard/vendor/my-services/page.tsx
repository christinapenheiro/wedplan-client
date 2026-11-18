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
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";

export default function VendorMyServicesPage() {
  const [services, setServices] = React.useState([
    {
      id: "SRV-1",
      title: "Full Day Cinematic Wedding Photography",
      category: "Photography",
      price: "$2,400",
      status: "Active",
      views: 420,
    },
    {
      id: "SRV-2",
      title: "Romantic Garden Floral Arch & Tablescapes",
      category: "Floral & Decor",
      price: "$1,850",
      status: "Active",
      views: 310,
    },
    {
      id: "SRV-3",
      title: "Rustic Barn Venue with Evening Fairy Lights",
      category: "Venue",
      price: "$5,200",
      status: "Active",
      views: 890,
    },
    {
      id: "SRV-4",
      title: "Artisanal 3-Tier Berry & Cream Wedding Cake",
      category: "Catering",
      price: "$750",
      status: "Draft",
      views: 45,
    },
  ]);

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Services
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your active wedding packages, pricing, and directory availability
          </p>
        </div>
        <Button className="bg-[#99616E] hover:bg-[#824E5B] text-white">
          <Link href="/dashboard/vendor/add-service" className="gap-2">
            <PlusCircle className="size-4" />
            <span>Add New Service</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#99616E]">
                    {service.category}
                  </span>
                  <CardTitle className="text-base font-semibold mt-1">
                    {service.title}
                  </CardTitle>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    service.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {service.status}
                </span>
              </div>
              <CardDescription className="text-sm font-semibold text-foreground mt-2">
                Starting at <span className="text-[#99616E]">{service.price}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-between border-t border-border mt-2 pt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Eye className="size-3.5" />
                {service.views} views
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" className="gap-1">
                  <Edit className="size-3" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleDelete(service.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
