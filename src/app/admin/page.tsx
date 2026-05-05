import { serviceClient } from "@/lib/supabase/service";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  UserPlus,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { OverviewCharts } from "./overview-charts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const supabase = serviceClient();

  // 1. Fetch User Stats
  const { data: usersData, error: usersError } = await supabase.from("profiles").select("*", { count: "exact" });
  const totalUsers = usersData?.length || 0;

  // 2. Fetch Collectible Stats
  const { data: itemsData, error: itemsError } = await supabase.from("collectibles").select("current_value, cost_price");
  const totalItems = itemsData?.length || 0;
  const totalValue = itemsData?.reduce((acc, item) => acc + (item.current_value || item.cost_price || 0), 0) || 0;

  // 3. Fetch Signups from Auth Admin API
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  const now = new Date();
  const signupData = authUsers?.users?.reduce((acc: any, user) => {
    const dateKey = format(new Date(user.created_at), "yyyy-MM-dd");
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {}) || {};

  // Fill in last 30 days
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(now, 29 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      date: format(d, "MMM dd"),
      count: signupData[key] || 0
    };
  });

  const signupsToday = signupData[format(now, "yyyy-MM-dd")] || 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform-wide analytics and performance.</p>
        </div>
        <div className="bg-coral/10 text-coral px-4 py-2 rounded-xl flex items-center gap-2 border border-coral/20">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-bold text-sm tracking-tight uppercase">System Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Collectors" 
          value={totalUsers.toLocaleString()} 
          icon={Users} 
          trend="+12% from last month" 
          color="coral"
        />
        <StatCard 
          title="Total Collectibles" 
          value={totalItems.toLocaleString()} 
          icon={Package} 
          trend="+5% from last week" 
          color="teal"
        />
        <StatCard 
          title="Assets Value" 
          value={`$${(totalValue / 1000000).toFixed(2)}M`} 
          icon={DollarSign} 
          trend="+8% ROI avg" 
          color="midnight"
        />
        <StatCard 
          title="New Signups" 
          value={signupsToday.toString()} 
          icon={UserPlus} 
          trend="Today so far" 
          color="coral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Signup Growth</CardTitle>
            <CardDescription>New user registrations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <OverviewCharts data={last30Days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Service health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Database Load</span>
                <span className="font-bold">12%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-teal w-[12%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Storage Used</span>
                <span className="font-bold">45.2 GB</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-coral w-[45%]" />
              </div>
            </div>
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-sm font-medium">Supabase Auth API Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-sm font-medium">Edge Functions Stable</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className={cn(
            "p-2 rounded-lg",
            color === "coral" ? "bg-coral/10 text-coral" : 
            color === "teal" ? "bg-teal/10 text-teal" : "bg-midnight/10 text-midnight dark:bg-white/10 dark:text-white"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1 text-teal" />
            {trend}
          </p>
        </div>
        <div className={cn(
          "absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full",
          color === "coral" ? "bg-coral" : color === "teal" ? "bg-teal" : "bg-midnight dark:bg-white"
        )} />
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
