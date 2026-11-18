"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, Heart, Save } from "lucide-react";

export default function CustomerProfileSettingsPage() {
  const { data: session } = authClient.useSession();

  const [partnerName, setPartnerName] = React.useState("Liam Vance");
  const [weddingDate, setWeddingDate] = React.useState("2026-10-14");
  const [budget, setBudget] = React.useState("25000");
  const [guestCount, setGuestCount] = React.useState("120");
  const [themeStyle, setThemeStyle] = React.useState("Rustic Romantic Glam");
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile & Wedding Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your personal wedding details, partner information, and planning preferences
        </p>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Wedding preferences saved successfully!</span>
        </div>
      )}

      {/* Account Info Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold">Personal Account</CardTitle>
          <CardDescription>Basic account identity and contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={session?.user?.name || ""} disabled className="bg-muted/30" />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={session?.user?.email || ""} disabled className="bg-muted/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Specific Settings */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2 text-[#99616E]">
            <Heart className="size-4" />
            <CardTitle className="text-base font-bold">Wedding Planning Details</CardTitle>
          </div>
          <CardDescription>
            These details help us calculate milestones, countdowns, and budgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="partnerName">Partner&apos;s Full Name</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Liam Vance"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget">Target Total Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guestCount">Estimated Guest Count</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="themeStyle">Wedding Vibe & Style</Label>
              <Input
                id="themeStyle"
                value={themeStyle}
                onChange={(e) => setThemeStyle(e.target.value)}
                placeholder="e.g. Modern Minimalist, Garden Romantic, Classic Elegance"
              />
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <Button type="submit" className="bg-[#99616E] hover:bg-[#824E5B] text-white">
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
