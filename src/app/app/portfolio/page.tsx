"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { motion, useSpring, useTransform, animate } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useCollectionStats } from "@/hooks/useCollectionStats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLORS = ["#FF6B6B", "#4ECDC4", "#1A1A2E", "#2D3436", "#95A5A6"];

export default function PortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase, session } = useSupabase();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 10000);

    async function fetchItems() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("collectibles")
          .select("*")
          .eq("user_id", session.user.id);

        if (!error && data) {
          setItems(data);
        }
      } catch (e) {
        console.error("Error fetching portfolio items:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }
    fetchItems();
    return () => clearTimeout(timeout);
  }, [supabase, session]);

  const stats = useCollectionStats(items);

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="md:col-span-2 h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">Collection Portfolio</h1>
        <p className="text-muted-foreground mt-1">Detailed financial analysis of your vault.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-midnight to-midnight/80 text-white border-none shadow-xl overflow-hidden relative group">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Total Collection Value</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold font-heading">
                $<AnimatedNumber value={stats.totalValue} />
              </span>
            </div>
            <div className="mt-8 flex gap-6">
              <div>
                <p className="text-xs text-white/40 uppercase">Profit/Loss</p>
                <p className={cn("text-lg font-bold flex items-center", stats.profitLoss >= 0 ? "text-teal" : "text-coral")}>
                  {stats.profitLoss >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                  ${Math.abs(stats.profitLoss).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase">ROI</p>
                <p className={cn("text-lg font-bold", stats.roi >= 0 ? "text-teal" : "text-coral")}>
                  {stats.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="h-32 w-32" />
          </div>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground uppercase">Investment</p>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mt-4">${stats.totalInvestment.toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground mt-1">Total cost basis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground uppercase">Item Count</p>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mt-4">{items.length}</h3>
            <p className="text-xs text-muted-foreground mt-1">Collectibles tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Value Over Time Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-coral" />
              Growth Over Time
            </CardTitle>
            <CardDescription>Cumulative collection value based on purchase dates</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.valueOverTime}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#888" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#888" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-teal" />
              Category Allocation
            </CardTitle>
            <CardDescription>Value distribution by type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Value"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stats.categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="capitalize">{entry.name}s</span>
                  </div>
                  <span className="font-bold">${(entry.value as any).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Assets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Value Collectibles</CardTitle>
            <CardDescription>Highest value items in your collection</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-lg">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium text-right">Investment</th>
                  <th className="px-6 py-3 font-medium text-right">Current Value</th>
                  <th className="px-6 py-3 font-medium text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.topItems.map((item) => {
                  const itemProfit = (item.current_value || item.cost_price || 0) - (item.cost_price || 0);
                  const itemRoi = item.cost_price > 0 ? (itemProfit / item.cost_price) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-midnight dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">{item.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        ${item.cost_price?.toLocaleString() || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-teal">
                        ${(item.current_value || item.cost_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          itemRoi >= 0 ? "bg-teal/10 text-teal" : "bg-coral/10 text-coral"
                        )}>
                          {itemRoi >= 0 ? "+" : ""}{itemRoi.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}
