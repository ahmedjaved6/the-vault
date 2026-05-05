"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  PlusCircle, 
  Briefcase, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Add", href: "/add", icon: PlusCircle },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Search", href: "/search", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { supabase, session } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out h-screen sticky top-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 font-heading font-bold text-xl text-coral">
              <Package className="h-6 w-6" />
              <span>Vault</span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto text-coral">
              <Package className="h-8 w-8" />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-3 top-16 rounded-full border bg-background shadow-sm h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-midnight dark:hover:text-white hover:bg-muted",
                      pathname === item.href && "bg-muted text-coral font-medium",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <div className="p-4 border-t space-y-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10 border-2 border-coral">
                <AvatarImage src={session?.user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-coral/10 text-coral">
                  {session?.user?.user_metadata?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{session?.user?.user_metadata?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-midnight dark:hover:text-white hover:bg-muted",
                pathname === "/settings" && "bg-muted text-coral font-medium",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Settings className="h-5 w-5" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-3 justify-start rounded-lg px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                isCollapsed && "justify-center px-2"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t px-4 py-2 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              pathname === item.href ? "text-coral" : "text-muted-foreground hover:text-midnight dark:hover:text-white"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
