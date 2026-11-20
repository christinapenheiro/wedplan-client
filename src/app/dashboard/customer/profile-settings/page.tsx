"use client";

import * as React from "react";
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
  Loader2,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";

/** Builds up to two uppercase initials for the avatar fallback. */
function getInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");

  return initials || "WW";
}

/** Formats an account role for display, e.g. "customer" → "Customer". */
function formatRole(role: IAccountRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function CustomerProfileSettingsPage() {
  const {
    data: session,
    isPending: sessionLoading,
    refetch,
  } = authClient.useSession();

  const user = session?.user;
  const role = ((user as { accountType?: IAccountRole } | undefined)?.accountType ??
    "customer") as IAccountRole;
  const router = useRouter()

  // `null` means "no local edits yet", so the field follows the session value.
  const [nameDraft, setNameDraft] = React.useState<string | null>(null);
  const name = nameDraft ?? user?.name ?? "";
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemovingImage, setIsRemovingImage] = React.useState(false);

  // Release the object URL created for the local preview.
  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const accountBusy = sessionLoading || isSaving || isRemovingImage;
  const currentImage = imagePreview ?? user?.image ?? undefined;

  /** Validates the picked file and swaps in a local preview before upload. */
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

  /** Drops the selected-but-not-yet-uploaded image and restores the saved one. */
  const handleDiscardPreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(null);
    setImagePreview(null);
  };

  /** Saves the name and (optionally) an uploaded avatar through Better Auth. */
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

    setIsSaving(true);

    try {
      const uploadedImage = imageFile
        ? await uploadToImgBB(imageFile)
        : undefined;

      const { error } = await authClient.updateUser({
        name: trimmedName,
        ...(uploadedImage ? { image: uploadedImage } : {}),
      });

      if (error) {
        throw new Error(error.message || "Failed to update your profile.");
      }

      handleDiscardPreview();
      await refetch();
      setNameDraft(null);
      router.refresh()
      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your account details have been saved.",
      });
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not update profile",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /** Clears the stored avatar by setting the Better Auth user image to null. */
  const handleRemoveImage = async () => {
    if (isRemovingImage) return;

    setIsRemovingImage(true);

    try {
      const { error } = await authClient.updateUser({ image: null });

      if (error) {
        throw new Error(error.message || "Failed to remove your photo.");
      }

      await refetch();

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
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account details and profile photo
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold">Personal Account</CardTitle>
          <CardDescription>
            Your name and photo come from your signed-in account. Email and role
            are managed by WedPlan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-16 border-border">
                {currentImage && (
                  <AvatarImage src={currentImage} alt={name || "Profile photo"} />
                )}
                <AvatarFallback className="text-lg">
                  {getInitials(name || user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="profileImage"
                    className={
                      buttonVariants({ variant: "outline", size: "sm" }) +
                      " cursor-pointer gap-1.5" +
                      (accountBusy ? " pointer-events-none opacity-50" : "")
                    }
                  >
                    <UploadCloud className="size-3.5" />
                    {currentImage ? "Change photo" : "Upload photo"}
                    <input
                      id="profileImage"
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
                      className="gap-1.5 text-destructive hover:bg-destructive/10"
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
                      {imagePreview ? "Discard" : "Remove"}
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, or WEBP — max 10MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  disabled={accountBusy}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="bg-muted/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email can&apos;t be changed here.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Account Role</Label>
                <Input
                  id="role"
                  value={formatRole(role)}
                  disabled
                  className="bg-muted/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your role is set when you sign up and can&apos;t be changed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <Button
                type="submit"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={accountBusy}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
