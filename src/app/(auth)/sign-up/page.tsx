"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "@/components/ui/toast";
import {
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Lock,
  HeartHandshake,
  Store,
  X,
  Sparkles,
} from "lucide-react";
import { IAccountRole } from "@/lib/types";



export default function SignUpPage() {
  const router = useRouter();

  // Form input state
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [accountType, setAccountType] = React.useState<IAccountRole>("customer");
  const [businessName, setBusinessName] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  // Real-time password requirement evaluations
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase;

  /**
   * Handles local image file selection and generates a client-side blob preview URL.
   * Cleans up the previous preview URL from memory to prevent memory leaks.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({ type: "error", title: "Invalid file", description: "Please select a valid image file (PNG, JPG, WEBP)." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.add({ type: "error", title: "File too large", description: "Image file size must be under 10MB." });
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * Clears the currently selected profile image and frees its allocated blob URL.
   */
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  /**
   * Orchestrates the entire sign-up pipeline:
   * 1. Validates required input fields and password constraints.
   * 2. Uploads the profile image to ImgBB if one was provided.
   * 3. Registers the user account via Better Auth with role metadata.
   * 4. Redirects to the homepage ("/") upon successful registration.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.add({ type: "error", title: "Missing name", description: "Please provide your full name." });
      return;
    }

    if (accountType === "vendor" && !businessName.trim()) {
      toast.add({ type: "error", title: "Missing business name", description: "Please provide your business name." });
      return;
    }

    if (!email.trim()) {
      toast.add({ type: "error", title: "Missing email", description: "Please provide a valid email address." });
      return;
    }

    if (!isPasswordValid) {
      toast.add({ type: "error", title: "Weak password", description: "Please satisfy all password requirements before proceeding." });
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | undefined = undefined;

      if (imageFile) {
        uploadedImageUrl = await uploadToImgBB(imageFile);
      }

      const signUpPayload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: uploadedImageUrl,
        callbackURL: "/",
        accountType,
        ...(accountType === "vendor"
          ? { businessName: businessName.trim() }
          : {}),
      };

      const { data, error } = await authClient.signUp.email(
        // signUpPayload as Parameters<typeof authClient.signUp.email>[0] & { role: AccountRole }
        signUpPayload,
      );


      if (error) {
        toast.add({
          type: "error",
          title: "Registration failed",
          description: error.message || "Registration failed. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      toast.add({
        type: "success",
        title: "Account created!",
        description: "Welcome to WedPlan. Redirecting you now...",
      });

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign up.";
      toast.add({ type: "error", title: "Sign up failed", description: message });
      setIsSubmitting(false);
    }
  };

  /**
   * Initiates Google Social OAuth through Better Auth.
   * Redirects users to Google consent screen and returns them to "/" upon completion.
   */
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initialize Google authentication.";
      toast.add({ type: "error", title: "Google sign in failed", description: message });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAF8FA] dark:bg-[#191417] px-4 py-12 overflow-hidden">
      {/* Ambient Wedding Palette Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#99616E]/20 blur-3xl" />

      <Card className="relative w-full max-w-lg shadow-xl shadow-[#C4B6D0]/20 border-[#D2D3D0] dark:border-[#423940] bg-white/95 dark:bg-[#221B20]/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto size-12 rounded-full bg-[#C4B6D0]/30 border border-[#C4B6D0] flex items-center justify-center text-[#99616E] mb-1">
            <HeartHandshake className="size-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 mx-auto px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C4B6D0]/25 text-[#99616E] border border-[#C4B6D0]/50">
            <Sparkles className="size-3" />
            <span>WedPlan Registration</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3]">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm text-[#756770] dark:text-[#A797A2]">
            Begin planning your dream wedding or managing client vendors
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Sign-in Option */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 gap-2 font-normal border-[#D2D3D0] dark:border-[#423940] hover:bg-[#F2EEF3] dark:hover:bg-[#2E252C] hover:border-[#C4B6D0] text-[#2A1F25] dark:text-[#F5EFF3]"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <Loader2 className="size-4 animate-spin text-[#99616E]" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#D2D3D0] dark:border-[#423940]" />
            <span className="absolute bg-white dark:bg-[#221B20] px-2 text-xs uppercase tracking-wider text-[#756770] dark:text-[#A797A2]">
              Or register with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#756770] dark:text-[#A797A2]">
                Account Role
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    accountType === "customer"
                      ? "border-[#99616E] bg-[#99616E]/10 ring-2 ring-[#99616E]/30 text-[#2A1F25] dark:text-[#F5EFF3]"
                      : "border-[#D2D3D0] dark:border-[#423940] hover:border-[#C4B6D0] hover:bg-[#F2EEF3]/60 dark:hover:bg-[#2E252C] text-[#756770]"
                  }`}
                >
                  <HeartHandshake
                    className={`size-5 mb-1 ${
                      accountType === "customer" ? "text-[#99616E]" : "text-[#756770]"
                    }`}
                  />
                  <span className="font-semibold text-sm">Customer</span>
                  <span className="text-[11px] text-[#756770] dark:text-[#A797A2] text-center mt-0.5">
                    Couples & Event Planners
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("vendor")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    accountType === "vendor"
                      ? "border-[#99616E] bg-[#99616E]/10 ring-2 ring-[#99616E]/30 text-[#2A1F25] dark:text-[#F5EFF3]"
                      : "border-[#D2D3D0] dark:border-[#423940] hover:border-[#C4B6D0] hover:bg-[#F2EEF3]/60 dark:hover:bg-[#2E252C] text-[#756770]"
                  }`}
                >
                  <Store
                    className={`size-5 mb-1 ${
                      accountType === "vendor" ? "text-[#99616E]" : "text-[#756770]"
                    }`}
                  />
                  <span className="font-semibold text-sm">Vendor</span>
                  <span className="text-[11px] text-[#756770] dark:text-[#A797A2] text-center mt-0.5">
                    Venues & Services
                  </span>
                </button>
              </div>
            </div>

            {/* Business Name — vendors only */}
            {accountType === "vendor" && (
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-2.5 size-4 text-[#756770]" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="e.g. Blush & Petal Co."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-9 border-[#D2D3D0] dark:border-[#423940] focus-visible:border-[#99616E] focus-visible:ring-[#99616E]/30"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-[#756770]" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 border-[#D2D3D0] dark:border-[#423940] focus-visible:border-[#99616E] focus-visible:ring-[#99616E]/30"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[#756770]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 border-[#D2D3D0] dark:border-[#423940] focus-visible:border-[#99616E] focus-visible:ring-[#99616E]/30"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-[#756770]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 border-[#D2D3D0] dark:border-[#423940] focus-visible:border-[#99616E] focus-visible:ring-[#99616E]/30"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#756770] hover:text-[#99616E] cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {/* Password Requirement Badges */}
              {/* <div className="pt-1.5 space-y-1 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength
                      ? "text-[#99616E] font-medium"
                      : "text-[#756770]"
                  }`}
                >
                  <CheckCircle2
                    className={`size-3.5 ${hasMinLength ? "opacity-100 text-[#99616E]" : "opacity-40"}`}
                  />
                  <span>At least 6 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase
                      ? "text-[#99616E] font-medium"
                      : "text-[#756770]"
                  }`}
                >
                  <CheckCircle2
                    className={`size-3.5 ${hasUppercase ? "opacity-100 text-[#99616E]" : "opacity-40"}`}
                  />
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasLowercase
                      ? "text-[#99616E] font-medium"
                      : "text-[#756770]"
                  }`}
                >
                  <CheckCircle2
                    className={`size-3.5 ${hasLowercase ? "opacity-100 text-[#99616E]" : "opacity-40"}`}
                  />
                  <span>At least one lowercase letter (a-z)</span>
                </div>
              </div> */}
            </div>

            {/* Profile Image (Optional - ImgBB Upload) */}
            <div className="space-y-1.5">
              <Label htmlFor="profileImage">Profile Image (Optional)</Label>
              {imagePreview ? (
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#C4B6D0] bg-[#C4B6D0]/10">
                  <Image
                    src={imagePreview}
                    alt="Profile Preview"
                    width={48}
                    height={48}
                    unoptimized
                    className="size-12 rounded-full object-cover border-2 border-[#99616E]/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-[#2A1F25] dark:text-[#F5EFF3]">
                      {imageFile?.name}
                    </p>
                    <p className="text-[11px] text-[#756770]">
                      {imageFile
                        ? `${(imageFile.size / 1024).toFixed(1)} KB`
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="text-[#756770] hover:text-destructive hover:bg-destructive/10"
                    title="Remove image"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <label
                    htmlFor="profileImage"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#D2D3D0] dark:border-[#423940] hover:border-[#C4B6D0] rounded-lg cursor-pointer bg-[#F2EEF3]/30 dark:bg-[#2E252C]/30 hover:bg-[#C4B6D0]/10 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      <UploadCloud className="size-6 text-[#99616E] mb-1" />
                      <p className="text-xs text-[#756770]">
                        <span className="font-semibold text-[#99616E]">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-[10px] text-[#756770] mt-0.5">
                        PNG, JPG or WEBP (Max 10MB)
                      </p>
                    </div>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 mt-2 font-medium bg-[#99616E] hover:bg-[#824E5B] text-white shadow-sm transition-all cursor-pointer"
              // disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-[#D2D3D0] dark:border-[#423940] pt-4">
          <p className="text-xs text-[#756770] dark:text-[#A797A2]">
            Already have an account?{" "}
            <Link prefetch={false}
              href="/sign-in"
              className="font-medium text-[#99616E] hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
