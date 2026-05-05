"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/providers/supabase-provider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { supabase } = useSupabase();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setIsLoading(false);
    if (error) {
      toast.error("Error sending reset link", {
        description: error.message,
      });
    } else {
      setIsSent(true);
      toast.success("Reset link sent!", {
        description: "Please check your email for the password reset link.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-xl bg-coral p-2 text-white">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold text-midnight dark:text-white">
            Reset Password
          </CardTitle>
          <CardDescription>
            {isSent 
              ? "We've sent a password reset link to your email." 
              : "Enter your email to receive a password reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-coral hover:bg-coral/90" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists for <strong>{email}</strong>, you will receive an email with instructions on how to reset your password shortly.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">
                  Return to Sign In
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        {!isSent && (
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/auth/signin" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
