"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  AlertCircle,
  UploadCloud,
  X,
  Loader2,
  DollarSign,
  Tag,
} from "lucide-react";
import { clientApi } from "@/lib/api/clientApi";
import type { IService, IServiceCategory } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

const CATEGORIES: IServiceCategory[] = [
  "photography",
  "venue",
  "floral",
  "catering",
  "makeup",
  "fashion",
  "music",
  "planner",
];

const CATEGORY_LABELS: Record<IServiceCategory, string> = {
  photography: "Photography & Videography",
  venue: "Wedding Venues",
  floral: "Decoration & Florist",
  catering: "Catering Services",
  makeup: "Makeup & Styling",
  fashion: "Wedding Fashion",
  music: "Music & Entertainment",
  planner: "Wedding Planner",
};

/** Uploads a single File to ImgBB and returns the hosted image URL. */
async function uploadToImgBB(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!key) throw new Error("ImgBB API key is not configured.");

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Image upload failed.");
  const json = await res.json();
  return json.data.display_url as string;
}

interface PreviewFile {
  /** Local blob URL for preview */
  previewUrl: string;
  /** Original File object */
  file: File;
  /** Hosted URL after ImgBB upload (undefined while uploading) */
  hostedUrl?: string;
  /** True while this individual file is uploading */
  uploading: boolean;
  /** Error message if the upload failed */
  error?: string;
}

export default function VendorAddServicePage() {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<IServiceCategory>("photography");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [previews, setPreviews] = React.useState<PreviewFile[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  // const [status, setStatus] = React.useState<"success" | "error" | null>(null);
  // const [errorMsg, setErrorMsg] = React.useState("");
  const { data:session } = authClient.useSession();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;


  /** Revoke all blob URLs when the component unmounts to avoid memory leaks */
  React.useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Handle new files selected by the user: create previews then upload each. */
  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Build preview entries immediately so the user sees thumbnails right away
    const newPreviews: PreviewFile[] = files.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      file,
      uploading: true,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";

    // Upload each file concurrently and update state as each resolves
    await Promise.all(
      newPreviews.map(async (entry) => {
        try {
          const hostedUrl = await uploadToImgBB(entry.file);
          setPreviews((prev) =>
            prev.map((p) =>
              p.previewUrl === entry.previewUrl
                ? { ...p, uploading: false, hostedUrl }
                : p
            )
          );
        } catch {
          setPreviews((prev) =>
            prev.map((p) =>
              p.previewUrl === entry.previewUrl
                ? { ...p, uploading: false, error: "Upload failed" }
                : p
            )
          );
        }
      })
    );
  };

  /** Remove a preview card and revoke its blob URL. */
  const removeImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setPreviews((prev) => prev.filter((p) => p.previewUrl !== previewUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setStatus(null);
    // setErrorMsg("");

    // Guard: all images must have finished uploading
    const stillUploading = previews.some((p) => p.uploading);
    if (stillUploading) {
      // setStatus("error");
      // setErrorMsg("Please wait for all images to finish uploading.");
      toast.add({
        type: "error",
        title: "Images still uploading",
        description: "Please wait for all images to finish uploading.",
      });
      return;
    }

    const imageUrls = previews
      .filter((p) => p.hostedUrl)
      .map((p) => p.hostedUrl as string);

    setSubmitting(true);
    // console.log("Submitting service:", { title, category, price, description, imageUrls });
    try {
      await clientApi.post<IService>("/services", {
        title,
        category,
        price: Number(price),
        description,
        imageUrls,
        vendorId: userId,
        vendorEmail: userEmail,
        status: "Pending", // New services start as Pending for admin review
        vendorName: session?.user?.name || undefined,
      });
      // setStatus("success");
      toast.add({
        type: "success",
        title: "Service Request Submitted",
        description: "Your service has been submitted for review. Once approved, it will be visible in your listings.",
      });
      // Reset form
      setTitle("");
      setCategory("photography");
      setPrice("");
      setDescription("");
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPreviews([]);
    } catch (err: unknown) {
      // setStatus("error");
      // setErrorMsg(
      //   err instanceof Error ? err.message : "Failed to publish service."
      // );
      toast.add({
        type: "error",
        title: "Could not publish service",
        description:
          err instanceof Error ? err.message : "Failed to publish service.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <Link
            href="/dashboard/vendor/my-services"
            aria-label="Back to my services"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Add New Wedding Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Publish a service to showcase to couples on the WedPlan directory
            </p>
          </div>
        </div>

        {/* Status banners */}
        {/* {status === "success" && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Service published successfully to your listings!</span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 text-sm">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )} */}

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Service Details</CardTitle>
            <CardDescription>
              Provide accurate pricing and descriptive information for couples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
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

              {/* Category + Price row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Service Category</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                    <select
                      id="category"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as IServiceCategory)
                      }
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-transparent text-sm shadow-xs focus:ring-2 focus:ring-[#99616E]/30 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price">Base Starting Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      placeholder="e.g. 1500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Package Description &amp; Inclusions
                </Label>
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

              {/* Gallery upload */}
              <div className="space-y-3">
                <Label>Service Gallery Images</Label>

                {/* Drop zone */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <UploadCloud className="size-8 text-[#99616E]" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload showcase photos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WEBP · up to 10 MB per image · multiple allowed
                  </p>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />

                {/* Image previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((p) => (
                      <div
                        key={p.previewUrl}
                        className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted"
                      >
                        <Image
                          src={p.previewUrl}
                          alt="gallery preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />

                        {/* Uploading overlay */}
                        {p.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="size-5 text-white animate-spin" />
                          </div>
                        )}

                        {/* Error overlay */}
                        {p.error && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-900/60">
                            <span className="text-xs text-white px-1 text-center">
                              {p.error}
                            </span>
                          </div>
                        )}

                        {/* Remove button */}
                        {!p.uploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(p.previewUrl)}
                            className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Link
                  href="/dashboard/vendor/my-services"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || previews.some((p) => p.uploading)}
                  className="bg-[#99616E] hover:bg-[#824E5B] text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <PlusCircle className="size-4 mr-2" />
                      Publish Service
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
