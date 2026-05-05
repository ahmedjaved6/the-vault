"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Share2, 
  Calendar, 
  DollarSign, 
  Box, 
  Info,
  Maximize2,
  ShieldCheck,
  Tag,
  Loader2,
  Package,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useSupabase } from "@/components/providers/supabase-provider";
import { cn } from "@/lib/utils";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      if (!session?.user?.id || !id) return;

      const { data, error } = await supabase
        .from("collectibles")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        toast.error("Item not found");
        router.push("/app");
        return;
      }

      setItem(data);
      setHeroImage(data.image_url);
      setLoading(false);
    }

    fetchItem();
  }, [id, supabase, session, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete from storage (gallery and primary)
      const imagesToDelete = [item.image_url, ...(item.gallery_urls || [])].filter(Boolean);
      for (const url of imagesToDelete) {
        const path = url.split("/storage/v1/object/public/collectible-images/")[1];
        if (path) {
          await supabase.storage.from("collectible-images").remove([path]);
        }
      }

      // 2. Delete from DB
      const { error } = await supabase.from("collectibles").delete().eq("id", id);
      if (error) throw error;

      toast.success("Item removed from vault");
      router.push("/app");
    } catch (error: any) {
      toast.error(error.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-coral" />
      </div>
    );
  }

  const properties = item.properties || {};
  
  const infoGrid = [
    { label: "Manufacturer", value: properties.manufacturer },
    { label: "License", value: properties.license_holder },
    { label: "Series", value: properties.series_name },
    { label: "Edition", value: properties.edition },
    { label: "Scale", value: properties.scale },
    { label: "Material", value: properties.material },
    { label: "Sculptor", value: properties.sculptor },
    { 
      label: "Dimensions", 
      value: properties.height_cm ? `${properties.height_cm} x ${properties.width_cm || '?'} x ${properties.depth_cm || '?'} cm` : null 
    },
    { label: "Weight", value: properties.weight_g ? `${properties.weight_g} g` : null },
    { 
      label: "Edition Info", 
      value: properties.edition_number ? `${properties.edition_number} / ${properties.edition_run || '?'}` : (properties.edition_run ? `ES ${properties.edition_run}` : null) 
    },
    { label: "Art Style", value: properties.art_style },
    { label: "Pose", value: properties.pose },
    { label: "Box Condition", value: properties.box_condition },
    { label: "Item Condition", value: properties.figure_condition },
    { label: "Authenticity", value: properties.authenticity },
    { label: "Purchase Date", value: item.purchase_date },
    { label: "Purchase Price", value: item.cost_price ? `$${item.cost_price.toLocaleString()}` : null },
    { label: "Current Value", value: item.current_value ? `$${item.current_value.toLocaleString()}` : null },
    { label: "Purchase Location", value: properties.purchase_location },
    { label: "Insured", value: properties.is_insured ? "Yes" : "No" },
  ].filter(i => i.value);

  const gallery = [item.image_url, ...(item.gallery_urls || [])].filter(Boolean);

  return (
    <div className="pb-20 md:pb-10">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href={`/card/${id}`}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Card
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/app/${id}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Item
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-2xl border">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-20 w-20 opacity-20" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {gallery.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setHeroImage(url)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    heroImage === url ? "border-coral scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={url} alt={`Thumb ${index}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-8">
          <div>
            <Badge variant="secondary" className="mb-2 bg-coral/10 text-coral hover:bg-coral/10">
              {item.category.toUpperCase()}
            </Badge>
            <h1 className="text-4xl font-heading font-bold text-midnight dark:text-white leading-tight">
              {item.name}
            </h1>
            {properties.series_name && (
              <p className="text-xl text-muted-foreground mt-1">{properties.series_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/30 border-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Current Value</p>
                <p className="text-2xl font-bold text-teal mt-1">
                  ${item.current_value?.toLocaleString() || item.cost_price?.toLocaleString() || "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Investment</p>
                <p className="text-2xl font-bold text-midnight dark:text-white mt-1">
                  ${item.cost_price?.toLocaleString() || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Info className="h-5 w-5 text-coral" />
              Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {infoGrid.map((detail, idx) => (
                <div key={idx} className="flex flex-col border-b border-muted py-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{detail.label}</span>
                  <span className="font-medium mt-1">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          {item.notes && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-coral" />
                Notes
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap rounded-xl bg-muted/30 p-4 border italic">
                "{item.notes}"
              </p>
            </div>
          )}
          
          <div className="sm:hidden pt-6">
            <Button className="w-full" asChild>
              <Link href={`/card/${id}`}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Collection Card
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{item.name}" from your vault and all associated images from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

