"use client";

import * as React from "react";
import Link from "next/link";
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
import { toast } from "@/components/ui/toast";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  // Form input state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  // UI state
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  /**
   * Submits user credentials to Better Auth email/password authentication endpoint.
   * On success, shows a success toast and redirects the user to the home page ("/").
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.add({ type: "error", title: "Missing email", description: "Please enter your email address." });
      return;
    }

    if (!password) {
      toast.add({ type: "error", title: "Missing password", description: "Please enter your password." });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL: "/",
        rememberMe,
      });

      if (error) {
        toast.add({
          type: "error",
          title: "Sign in failed",
          description: error.message || "Invalid email or password. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      toast.add({
        type: "success",
        title: "Signed in successfully!",
        description: "Redirecting to your dashboard...",
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
      toast.add({ type: "error", title: "Sign in failed", description: message });
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
        err instanceof Error ? err.message : "Failed to initialize Google authentication.";
      toast.add({ type: "error", title: "Google sign in failed", description: message });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAF8FA] dark:bg-[#191417] px-4 py-12 overflow-hidden">
      {/* Ambient Theme Color Glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#99616E]/20 blur-3xl" />

      <Card className="relative w-full max-w-md shadow-xl shadow-[#C4B6D0]/20 border-[#D2D3D0] dark:border-[#423940] bg-white/95 dark:bg-[#221B20]/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto size-12 rounded-full bg-[#C4B6D0]/30 border border-[#C4B6D0] flex items-center justify-center text-[#99616E] mb-1">
            <HeartHandshake className="size-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 mx-auto px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C4B6D0]/25 text-[#99616E] border border-[#C4B6D0]/50">
            <Sparkles className="size-3" />
            <span>Welcome Back</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3]">
            Sign in to WedPlan
          </CardTitle>
          <CardDescription className="text-sm text-[#756770] dark:text-[#A797A2]">
            Enter your credentials to access your wedding workspace
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
              Or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link prefetch={false}
                  href="#"
                  className="text-xs text-[#99616E] hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.add({ type: "info", title: "Password reset", description: "Password reset is currently configured via email. Please contact support." });
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-[#756770]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-[#D2D3D0] text-[#99616E] focus:ring-[#99616E] accent-[#99616E] cursor-pointer"
                disabled={isSubmitting}
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs text-[#756770] dark:text-[#A797A2] cursor-pointer select-none"
              >
                Remember me on this device
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 mt-2 font-medium bg-[#99616E] hover:bg-[#824E5B] text-white shadow-sm transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-[#D2D3D0] dark:border-[#423940] pt-4">
          <p className="text-xs text-[#756770] dark:text-[#A797A2]">
            Don&apos;t have an account?{" "}
            <Link prefetch={false}
              href="/sign-up"
              className="font-medium text-[#99616E] hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
