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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  DollarSign,
  Tag,
} from "lucide-react";

export default function VendorAddServicePage() {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Photography");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Title & Back Nav */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/vendor/my-services">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Add New Wedding Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Publish a service to showcase to couples on the WedPlan directory
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Service published successfully to your listings!</span>
        </div>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
          <CardDescription>
            Provide accurate pricing and descriptive information for couples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="serviceTitle">Service Title</Label>
              <Input
                id="serviceTitle"
                placeholder="e.g. Full Day Cinematic Wedding Videography"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Service Category</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-transparent text-sm shadow-xs focus:ring-2 focus:ring-[#99616E]/30 outline-none"
                  >
                    <option value="Photography">Photography & Video</option>
                    <option value="Venue">Venue & Banquets</option>
                    <option value="Floral">Floral & Decor</option>
                    <option value="Catering">Catering & Bakery</option>
                    <option value="Music">DJ & Live Music</option>
                    <option value="Planner">Wedding Planner & Styling</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Base Starting Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g. 1500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Package Description & Inclusions</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe what is included in this package (hours, deliverables, equipment, crew size)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-transparent text-sm shadow-xs focus:ring-2 focus:ring-[#99616E]/30 outline-none resize-y"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Service Gallery Images</Label>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                <UploadCloud className="size-8 text-[#99616E] mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload showcase photos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PNG, JPG or WEBP up to 10MB per image
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/vendor/my-services">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-[#99616E] hover:bg-[#824E5B] text-white">
                <PlusCircle className="size-4 mr-2" />
                Publish Service
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
