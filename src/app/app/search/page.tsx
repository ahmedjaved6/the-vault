"use client";

import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Filter, X, SlidersHorizontal, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/collectors/item-card";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
        console.error("Error fetching search items:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }
    fetchItems();
    return () => clearTimeout(timeout);
  }, [supabase, session]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (item.properties?.manufacturer?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (item.properties?.series_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">Vault Search</h1>
        <p className="text-muted-foreground mt-1">Find and filter your collectibles instantly.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, manufacturer, or series..." 
            className="pl-10 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-midnight"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl px-4">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Vault</SheetTitle>
              <SheetDescription>Narrow down your collection view.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="statue">Statues</SelectItem>
                    <SelectItem value="figure">Figures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-6 border-t">
              <Button className="w-full" onClick={() => { setCategoryFilter("all"); setSearchQuery(""); }}>
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-midnight dark:text-white">{filteredItems.length}</span> results
          </p>
          {(searchQuery || categoryFilter !== "all") && (
            <Button variant="link" size="sm" onClick={() => { setCategoryFilter("all"); setSearchQuery(""); }} className="text-coral">
              Clear all filters
            </Button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-3xl border border-dashed">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold">No items found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
