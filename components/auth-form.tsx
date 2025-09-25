// ===== /components/auth-form.tsx =====
"use client";

import { login } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import Link from "next/link";

export default function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSignIn = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await login(formData);

      if (!result.success) {
        setError(result.error || "Failed to sign in");
        toast.error(result.error || "Failed to sign in");
      } else {
        toast.success("Welcome back!");
        // Small delay to allow auth state to propagate
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-grey-600 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-grey-600 tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-grey-500 mt-2">
            Sign in to your Trickipedia account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignIn} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="bg-white/80"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <PasswordInput
                id="signin-password"
                name="password"
                required
                placeholder="Enter your password"
                className="bg-white/80"
                disabled={isPending}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-grey-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
