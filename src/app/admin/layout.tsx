import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = userProfile;
    }
  } catch (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground">The application environment is not correctly configured. Please check your Supabase variables.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/auth/signin");
  }

  if (profile?.role !== "admin") {
    redirect("/app");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-shrink-0">
        <AdminSidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top bar */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-6 w-6 text-coral" />
            <span className="font-heading font-black tracking-tighter">THE VAULT ADMIN</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{profile.full_name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">System Administrator</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-coral/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-coral/10 text-coral">{profile.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </main>

      {/* Mobile Nav could be added here if needed, but for now we focus on Desktop Admin */}
    </div>
  );
}
