"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/providers/supabase-provider";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabase();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords mismatch", {
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);
    if (error) {
      toast.error("Error updating password", {
        description: error.message,
      });
    } else {
      setIsSuccess(true);
      toast.success("Password updated!", {
        description: "Your password has been changed successfully.",
      });
      setTimeout(() => {
        router.push("/app");
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-xl bg-coral p-2 text-white">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold text-midnight dark:text-white">
            Set New Password
          </CardTitle>
          <CardDescription>
            Choose a strong password to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuccess ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                Update Password
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-teal" />
              </div>
              <p className="font-medium text-midnight dark:text-white">
                Password updated successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you to your vault...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
