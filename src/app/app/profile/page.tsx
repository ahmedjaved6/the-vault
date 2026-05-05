"use client";

import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  if (!session) return null;

  const user = session.user;
  const metadata = user.user_metadata;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-32 w-32 border-4 border-coral shadow-xl">
          <AvatarImage src={metadata?.avatar_url} />
          <AvatarFallback className="text-4xl bg-coral/10 text-coral">
            {metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">
            {metadata?.full_name || "Collector"}
          </h1>
          <p className="text-muted-foreground">@{metadata?.username || "vault_user"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 py-2 border-b">
              <Mail className="h-5 w-5 text-coral" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-2 border-b">
              <Calendar className="h-5 w-5 text-coral" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase">Member Since</p>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-2">
              <Shield className="h-5 w-5 text-coral" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase">Account Type</p>
                <p className="font-medium capitalize">{metadata?.role || "Free Collector"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full h-12 text-base font-bold shadow-lg shadow-destructive/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout from Vault
        </Button>
      </div>
    </div>
  );
}
