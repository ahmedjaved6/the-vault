"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  PlusCircle, 
  User as UserIcon,
  Loader2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/collectors/item-card";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase, session } = useSupabase();

  useEffect(() => {
    // Safety net timeout
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
          .order("created_at", { ascending: false });

        if (!error && data) {
          setItems(data);
        }
      } catch (e) {
        console.error("Error fetching items:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }

    fetchItems();
    return () => clearTimeout(timeout);
  }, [supabase, session]);

  const totalValue = items.reduce((acc, item) => acc + (item.current_value || item.cost_price || 0), 0);
  const totalInvestment = items.reduce((acc, item) => acc + (item.cost_price || 0), 0);
  const profitLoss = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">
            Welcome back, {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Collector'}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your vault today.</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="bg-coral hover:bg-coral/90 shadow-lg shadow-coral/20">
              <Plus className="mr-2 h-5 w-5" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Choose Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/add?category=statue" className="flex items-center gap-2 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                <span>Add Statue</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/add?category=figure" className="flex items-center gap-2 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                <span>Add Figure</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Section */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemAnim}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-midnight to-midnight/90 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-midnight-foreground/60 opacity-70">Total Items</p>
                <Package className="h-5 w-5 text-coral" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">{items.length}</h3>
                <p className="text-xs mt-1 text-white/50">Stored in your vault</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Collection Value</p>
                <DollarSign className="h-5 w-5 text-teal" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">${totalValue.toLocaleString()}</h3>
                <p className="text-xs mt-1 text-muted-foreground">Market estimate</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <DollarSign className="h-5 w-5 text-midnight dark:text-white" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">${totalInvestment.toLocaleString()}</h3>
                <p className="text-xs mt-1 text-muted-foreground">Initial cost basis</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                {profitLoss >= 0 ? <TrendingUp className="h-5 w-5 text-teal" /> : <TrendingDown className="h-5 w-5 text-coral" />}
              </div>
              <div className="mt-4">
                <h3 className={cn("text-3xl font-bold", profitLoss >= 0 ? "text-teal" : "text-coral")}>
                  {profitLoss >= 0 ? "+" : ""}{profitLoss.toFixed(1)}%
                </h3>
                <p className="text-xs mt-1 text-muted-foreground">Over investment</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-10 mb-6">
            <Package className="h-20 w-20 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-midnight dark:text-white">Your vault is empty</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Start cataloging your collectibles to track their value and manage your portfolio.
          </p>
          <Button asChild className="mt-8 bg-midnight text-white hover:bg-midnight/90 dark:bg-white dark:text-midnight">
            <Link href="/app/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add your first collectible
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold text-midnight dark:text-white">Recently Added</h2>
            <Button variant="ghost" asChild className="text-coral hover:text-coral hover:bg-coral/5">
              <Link href="/app/collectibles" className="flex items-center">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {items.slice(0, 5).map((item, index) => (
              <motion.div key={item.id} variants={itemAnim}>
                <ItemCard item={item} priority={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
