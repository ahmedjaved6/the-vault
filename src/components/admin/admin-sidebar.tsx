"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Shield, 
  ArrowLeft,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Package, label: "Items", href: "/admin/items" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-midnight text-white w-64 border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 bg-coral rounded flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tighter leading-none">THE VAULT</h1>
            <Badge variant="outline" className="text-[10px] h-4 border-coral/50 text-coral mt-1 px-1">ADMIN MODE</Badge>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive ? "bg-coral text-white shadow-lg shadow-coral/20" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}>
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Controls</p>
          <div className="space-y-1">
            <Link href="/app" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2">
              <ArrowLeft className="h-4 w-4" />
              Exit to Collector App
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
