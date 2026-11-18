"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function VendorSubscriptionPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$29",
      billing: "/month",
      description: "Ideal for emerging wedding vendors and local specialists",
      features: [
        "Up to 3 active service packages",
        "Direct email client leads",
        "Standard directory listing",
        "Basic booking tracker",
      ],
      current: false,
      cta: "Downgrade",
      variant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$79",
      billing: "/month",
      description: "Our most popular tier for established wedding professionals",
      features: [
        "Up to 12 active service packages",
        "Priority ranking in search directory",
        "Client messaging & automated quotes",
        "Verified Vendor Badge",
        "Full booking & payment analytics",
      ],
      current: true,
      cta: "Current Plan",
      variant: "default" as const,
    },
    {
      name: "Elite Agency",
      price: "$149",
      billing: "/month",
      description: "For multi-service agencies, luxury venues, and premier planners",
      features: [
        "Unlimited service packages",
        "Homepage featured spot rotation",
        "Dedicated account manager",
        "Custom contracts & deposit collection",
        "Zero platform booking fees",
      ],
      current: false,
      cta: "Upgrade to Elite",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Subscription & Membership
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select the membership tier that fits your wedding vendor business goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col justify-between border ${
              tier.current
                ? "border-[#99616E] ring-2 ring-[#99616E]/20 bg-gradient-to-b from-[#99616E]/5 to-transparent"
                : "border-border"
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                {tier.current && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#99616E] text-white">
                    Active
                  </span>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                {tier.description}
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  {tier.price}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tier.billing}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Features included:
              </span>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-[#99616E] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4 border-t border-border">
              <Button
                variant={tier.current ? "default" : "outline"}
                className={`w-full text-xs font-semibold ${
                  tier.current
                    ? "bg-[#99616E] hover:bg-[#824E5B] text-white"
                    : "border-border hover:border-[#99616E]"
                }`}
                disabled={tier.current}
              >
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
