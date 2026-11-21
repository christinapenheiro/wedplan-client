"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import type { IAccountRole } from "@/lib/types";
import {
  Building2,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  Trash2,
  UploadCloud,
  User,
} from "lucide-react";

/** Builds up to two uppercase initials for the avatar fallback. */
function getInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "WP";
}


interface ProfileSettingsFormProps {
  title?: string;
  description?: string;
}

export default function ProfileSettingsForm({
  title = "Profile Settings",
  description = "Manage your account details and profile photo",
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const {
    data: session,
    isPending: sessionLoading,
    refetch,
  } = authClient.useSession();

  const user = session?.user;

  const rawRole = (user as { role?: string } | undefined)?.role?.toLowerCase();
  const rawAccountType = (
    user as { accountType?: IAccountRole } | undefined
  )?.accountType?.toLowerCase();

  const isVendor = rawAccountType === "vendor";
  const roleDisplay = rawRole === "admin" ? "Admin" : isVendor ? "Vendor" : "Customer";

  // Editable fields state
  const [nameDraft, setNameDraft] = React.useState<string | null>(null);
  const name = nameDraft ?? user?.name ?? "";

  const [businessNameDraft, setBusinessNameDraft] = React.useState<string | null>(null);
  const currentBusinessName =
    (user as { businessName?: string } | undefined)?.businessName ?? "";
  const businessName = businessNameDraft ?? currentBusinessName;

  // Photo management state
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemovingImage, setIsRemovingImage] = React.useState(false);

  // Clean up the object URL on preview change or unmount
  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const accountBusy = sessionLoading || isSaving || isRemovingImage;
  const currentImage = imagePreview ?? user?.image ?? undefined;

  /** Validates the picked image file and generates a local preview URL. */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({
        type: "error",
        title: "Unsupported file",
        description: "Please select a PNG, JPG, or WEBP image.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.add({
        type: "error",
        title: "Image too large",
        description: "Please choose an image under 10MB.",
      });
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /** Drops the local preview without uploading. */
  const handleDiscardPreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  /** Saves updated details through Better Auth. */
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.add({
        type: "error",
        title: "Name is required",
        description: "Please enter your full name before saving.",
      });
      return;
    }

    if (isVendor && !businessName.trim()) {
      toast.add({
        type: "error",
        title: "Business name required",
        description: "Please enter your business or studio name.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. If an image file was selected, upload it to ImgBB first
      const uploadedImageUrl = imageFile
        ? await uploadToImgBB(imageFile)
        : undefined;

      // 2. Prepare payload for updating user details
      const updatePayload: {
        name: string;
        image?: string;
        businessName?: string;
      } = {
        name: trimmedName,
        ...(uploadedImageUrl ? { image: uploadedImageUrl } : {}),
        ...(isVendor ? { businessName: businessName.trim() } : {}),
      };

      const { error } = await authClient.updateUser(updatePayload);

      if (error) {
        throw new Error(error.message || "Failed to update your profile.");
      }

      handleDiscardPreview();
      await refetch();
      setNameDraft(null);
      setBusinessNameDraft(null);
      router.refresh();

      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your account details have been successfully saved.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Please try again in a moment.";
      toast.add({
        type: "error",
        title: "Could not update profile",
        description: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /** Clears the stored avatar photo by setting Better Auth image to null. */
  const handleRemoveImage = async () => {
    if (isRemovingImage) return;

    setIsRemovingImage(true);

    try {
      const { error } = await authClient.updateUser({ image: null });

      if (error) {
        throw new Error(error.message || "Failed to remove your photo.");
      }

      await refetch();
      router.refresh();

      toast.add({
        type: "success",
        title: "Photo removed",
        description: "Your profile photo has been cleared.",
      });
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not remove photo",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="pb-3 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">
            Account Information
          </CardTitle>
          <CardDescription>
            Update your name, profile photo
            {isVendor ? ", and business name" : ""}. Email address and account
            role are fixed.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-muted/20 border border-border/80">
              <Avatar className="size-20 border-2 border-primary/20 shadow-xs shrink-0">
                {currentImage && (
                  <AvatarImage
                    src={currentImage}
                    alt={name || "Profile photo"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {getInitials(name || user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="profileImageInput"
                    className={
                      buttonVariants({ variant: "outline", size: "sm" }) +
                      " cursor-pointer gap-1.5 border-border hover:bg-muted font-medium text-xs h-8" +
                      (accountBusy ? " pointer-events-none opacity-50" : "")
                    }
                  >
                    <UploadCloud className="size-3.5 text-primary" />
                    <span>{currentImage ? "Change photo" : "Upload photo"}</span>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={accountBusy}
                    />
                  </label>

                  {currentImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 text-xs h-8 font-medium"
                      onClick={
                        imagePreview ? handleDiscardPreview : handleRemoveImage
                      }
                      disabled={accountBusy}
                    >
                      {isRemovingImage ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      <span>{imagePreview ? "Discard preview" : "Remove photo"}</span>
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supported formats: PNG, JPG, or WEBP up to 10MB.
                </p>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name (Editable) */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName" className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  disabled={accountBusy}
                  required
                  className="border-border focus-visible:ring-primary"
                />
              </div>

              {/* Business Name (Editable for Vendors) */}
              {isVendor && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="businessName" className="text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary" />
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessNameDraft(e.target.value)}
                    placeholder="e.g. Bloom & Co. Floral Studio"
                    disabled={accountBusy}
                    required
                    className="border-border focus-visible:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your public vendor/company name displayed on services and quotes.
                  </p>
                </div>
              )}

              {/* Email Address (Fixed / Non-editable) */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-3.5" />
                  Email Address
                  <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-0.5">
                    <Lock className="size-2.5" /> (Fixed)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="bg-muted/40 border-border/80 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your email is permanent and cannot be modified.
                </p>
              </div>

              {/* Account Role (Fixed / Non-editable) */}
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3.5" />
                  Account Role
                  <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-0.5">
                    <Lock className="size-2.5" /> (Fixed)
                  </span>
                </Label>
                <Input
                  id="role"
                  value={roleDisplay}
                  disabled
                  className="bg-muted/40 border-border/80 text-muted-foreground cursor-not-allowed font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your role is assigned upon registration and cannot be changed.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs h-9 px-4 text-xs font-semibold"
                disabled={accountBusy}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
