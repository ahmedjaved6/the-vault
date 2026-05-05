"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Maximize2, 
  ShieldCheck, 
  FileText, 
  Landmark, 
  Users,
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Car
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { ImageUploader, MultiImageUploader } from "./image-uploader";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["statue", "figure", "hotwheel"]),
  // Basic Info
  artist_name: z.string().optional(),
  manufacturer: z.string().optional(),
  license_holder: z.string().optional(),
  series_name: z.string().optional(),
  edition: z.string().optional(),
  art_style: z.string().optional(),
  pose: z.string().optional(),
  // Physical Details
  scale: z.string().optional(),
  material: z.string().optional(),
  height_cm: z.coerce.number().optional(),
  width_cm: z.coerce.number().optional(),
  depth_cm: z.coerce.number().optional(),
  weight_g: z.coerce.number().optional(),
  sculptor: z.string().optional(),
  // Edition & Rarity
  edition_run: z.coerce.number().int().optional(),
  edition_number: z.coerce.number().int().optional(),
  // Provenance & Value
  purchase_date: z.date().optional(),
  cost_price: z.coerce.number().optional(),
  current_value: z.coerce.number().optional(),
  original_retail_price: z.coerce.number().optional(),
  purchase_location: z.string().optional(),
  purchase_receipt_url: z.string().optional(),
  is_insured: z.boolean().default(false),
  // Condition
  box_condition: z.string().optional(),
  figure_condition: z.string().optional(),
  authenticity: z.string().optional(),
  // Media
  image_url: z.string().optional(),
  gallery_urls: z.array(z.string()).default([]),
  // Notes
  notes: z.string().optional(),
  // Hot Wheels Specific
  model_name: z.string().optional(),
  series: z.string().optional(),
  year: z.coerce.number().nullable().optional(),
  color: z.string().optional(),
  tampo_print: z.string().optional(),
  wheel_type: z.string().optional(),
  condition: z.string().optional(),
  blister_condition: z.string().optional(),
  toy_number: z.string().optional(),
  is_treasure_hunt: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CollectibleFormProps {
  initialData?: {
    id?: string;
    name?: string;
    category?: "statue" | "figure" | "hotwheel";
    purchase_date?: string;
    cost_price?: number;
    current_value?: number;
    notes?: string;
    image_url?: string;
    gallery_urls?: string[];
    properties?: Record<string, any>;
  };
  isEdit?: boolean;
}

export function CollectibleForm({ initialData, isEdit }: CollectibleFormProps) {
  const [step, setStep] = useState(initialData ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    physical: true,
    rarity: true,
    value: true,
    condition: true,
    media: true,
    notes: true,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, session } = useSupabase();
  
  useEffect(() => {
    if (searchParams.get("open") === "true") {
      setOpenSections({
        basic: true,
        physical: true,
        rarity: true,
        value: true,
        condition: true,
        media: true,
        notes: true,
      });
    }
  }, [searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: (initialData ? {
      name: initialData.name ?? "",
      category: initialData.category ?? "statue",
      artist_name: initialData.properties?.artist_name ?? "",
      manufacturer: initialData.properties?.manufacturer ?? "",
      license_holder: initialData.properties?.license_holder ?? "",
      series_name: initialData.properties?.series_name ?? "",
      edition: initialData.properties?.edition ?? "",
      art_style: initialData.properties?.art_style ?? "",
      pose: initialData.properties?.pose ?? "",
      model_name: initialData.properties?.model_name ?? "",
      series: initialData.properties?.series ?? "",
      year: initialData.properties?.year ?? null,
      color: initialData.properties?.color ?? "",
      tampo_print: initialData.properties?.tampo_print ?? "",
      wheel_type: initialData.properties?.wheel_type ?? "",
      condition: initialData.properties?.condition ?? "Carded Mint",
      blister_condition: initialData.properties?.blister_condition ?? "Unpunched",
      toy_number: initialData.properties?.toy_number ?? "",
      is_treasure_hunt: initialData.properties?.is_treasure_hunt ?? false,
      scale: initialData.properties?.scale ?? "",
      material: initialData.properties?.material ?? "",
      height_cm: initialData.properties?.height_cm ?? null,
      width_cm: initialData.properties?.width_cm ?? null,
      depth_cm: initialData.properties?.depth_cm ?? null,
      weight_g: initialData.properties?.weight_g ?? null,
      sculptor: initialData.properties?.sculptor ?? "",
      edition_run: initialData.properties?.edition_run ?? null,
      edition_number: initialData.properties?.edition_number ?? null,
      purchase_date: initialData.purchase_date ? new Date(initialData.purchase_date) : undefined,
      cost_price: initialData.cost_price ?? null,
      current_value: initialData.current_value ?? null,
      original_retail_price: initialData.properties?.original_retail_price ?? null,
      purchase_location: initialData.properties?.purchase_location ?? "",
      is_insured: initialData.properties?.is_insured ?? false,
      box_condition: initialData.properties?.box_condition ?? "",
      figure_condition: initialData.properties?.figure_condition ?? "",
      authenticity: initialData.properties?.authenticity ?? "",
      image_url: initialData.image_url ?? "",
      gallery_urls: initialData.gallery_urls ?? [],
      notes: initialData?.notes ?? "",
    } : {
      name: "",
      category: "statue" as const,
      artist_name: "",
      manufacturer: "",
      license_holder: "",
      series_name: "",
      edition: "",
      art_style: "",
      pose: "",
      model_name: "",
      series: "",
      year: null,
      color: "",
      tampo_print: "",
      wheel_type: "",
      condition: "Carded Mint",
      blister_condition: "Unpunched",
      toy_number: "",
      is_treasure_hunt: false,
      scale: "",
      material: "",
      height_cm: null,
      width_cm: null,
      depth_cm: null,
      weight_g: null,
      sculptor: "",
      edition_run: null,
      edition_number: null,
      purchase_date: undefined,
      cost_price: null,
      current_value: null,
      original_retail_price: null,
      purchase_location: "",
      is_insured: false,
      box_condition: "",
      figure_condition: "",
      authenticity: "",
      image_url: "",
      gallery_urls: [],
      notes: "",
    }) as any,
  });

  const category = form.watch("category");

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  async function onSubmit(values: FormValues) {
    if (!session?.user?.id) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    setIsLoading(true);
    
    // Separate core fields from properties
    const { 
      name, 
      category, 
      purchase_date, 
      cost_price, 
      current_value, 
      notes, 
      image_url, 
      gallery_urls,
      ...properties 
    } = values;

    const data = {
      user_id: session.user.id,
      name,
      category,
      purchase_date: purchase_date ? format(purchase_date, "yyyy-MM-dd") : null,
      cost_price,
      current_value,
      notes,
      image_url,
      gallery_urls,
      properties,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit && initialData?.id) {
        const { error } = await supabase
          .from("collectibles")
          .update(data)
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Collectible updated successfully!");
      } else {
        const { data: inserted, error } = await supabase
          .from("collectibles")
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        toast.success("Collectible added to your vault!");
        router.push(`/app/items/${inserted.id}`);
        return;
      }
      router.push(`/app/items/${initialData?.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-midnight dark:text-white mb-2">Add New Collectible</h1>
          <p className="text-muted-foreground">Select a category to get started.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            data-testid="category-card-statue"
            className="group cursor-pointer hover:border-coral transition-all duration-300 overflow-hidden"
            onClick={() => {
              form.setValue("category", "statue");
              setStep(1);
            }}
          >
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-coral/10 p-6 text-coral group-hover:bg-coral group-hover:text-white transition-all duration-300">
                <Landmark className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2">Statue</h2>
              <p className="text-muted-foreground">Polystone, Resin, or Cold Cast masterpieces.</p>
            </CardContent>
          </Card>

          <Card 
            data-testid="category-card-figure"
            className="group cursor-pointer hover:border-teal transition-all duration-300 overflow-hidden"
            onClick={() => {
              form.setValue("category", "figure");
              setStep(1);
            }}
          >
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-teal/10 p-6 text-teal group-hover:bg-teal group-hover:text-white transition-all duration-300">
                <Users className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2">Figure</h2>
              <p className="text-muted-foreground">PVC, ABS, or Action figures with articulation.</p>
            </CardContent>
          </Card>

          <Card 
            data-testid="category-card-hotwheel"
            className="group cursor-pointer hover:border-midnight transition-all duration-300 overflow-hidden"
            onClick={() => {
              form.setValue("category", "hotwheel");
              setStep(1);
            }}
          >
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-midnight/10 p-6 text-midnight group-hover:bg-midnight group-hover:text-white transition-all duration-300">
                <Car className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2">Hot Wheels</h2>
              <p className="text-muted-foreground">Mattel die-cast cars, Treasure Hunts, and more.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">
            {isEdit ? "Edit Collectible" : `Add ${form.getValues("category") === "statue" ? "Statue" : form.getValues("category") === "figure" ? "Figure" : "Hot Wheels"}`}
          </h1>
          <p className="text-muted-foreground">Fill in the details below to catalog your item.</p>
        </div>
        {!isEdit && (
          <Button variant="ghost" onClick={() => setStep(0)} className="text-muted-foreground">
            Change Category
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <CollapsibleSection
            title="Basic Information"
            icon={<Info className="h-5 w-5" />}
            open={openSections.basic}
            onToggle={() => toggleSection("basic")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Darth Vader Premium Format" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sideshow Collectibles" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artist_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist / Line</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. XM Studios" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_holder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Star Wars" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="series_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mythos" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {category === 'hotwheel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
                <FormField
                  control={form.control}
                  name="model_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Custom '69 Chevy Pickup" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hot Wheels Series</FormLabel>
                      <FormControl><Input placeholder="e.g. HW Hot Trucks" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 2025" {...field} value={field.value || ''} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl><Input placeholder="e.g. Matte Black" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tampo_print"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tampo / Print Details</FormLabel>
                      <FormControl><Input placeholder="e.g. Flames on hood" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Physical Details */}
          <CollapsibleSection
            title="Physical Details"
            icon={<Maximize2 className="h-5 w-5" />}
            open={openSections.physical}
            onToggle={() => toggleSection("physical")}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scale</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1/4" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Polystone", "Resin", "PVC", "ABS", "Cold Cast", "Vinyl", "Other"].map(m => (
                          <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sculptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sculptor</FormLabel>
                    <FormControl>
                      <Input placeholder="Artist name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-2 md:col-span-3">
                <FormField
                  control={form.control}
                  name="height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="width_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (cm)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depth_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depth (cm)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {category === 'hotwheel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
                <FormField
                  control={form.control}
                  name="wheel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wheel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select wheels" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["5SP", "Real Riders", "PR5", "10SP", "OH5", "Aero", "Other"].map(w => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Edition & Rarity */}
          <CollapsibleSection
            title="Edition & Rarity"
            icon={<ShieldCheck className="h-5 w-5" />}
            open={openSections.rarity}
            onToggle={() => toggleSection("rarity")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="edition_run"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Edition Size (ES)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 500" {...field} />
                    </FormControl>
                    <FormDescription>Total number produced</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="edition_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edition Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 125" {...field} />
                    </FormControl>
                    <FormDescription>Your specific number (e.g. 125 / 500)</FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {category === 'hotwheel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
                <FormField
                  control={form.control}
                  name="toy_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toy Number</FormLabel>
                      <FormControl><Input placeholder="e.g. HTF56" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_treasure_hunt"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-midnight/5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-teal font-bold">Treasure Hunt</FormLabel>
                        <FormDescription>Is this a TH or Super TH?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Provenance & Value */}
          <CollapsibleSection
            title="Provenance & Value"
            icon={<CalendarIcon className="h-5 w-5" />}
            open={openSections.value}
            onToggle={() => toggleSection("value")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Market Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retailer / Seller</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BigBadToyStore" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_insured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Insured</FormLabel>
                      <FormDescription>Item is covered by collectibles insurance</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleSection>

          {/* Condition */}
          <CollapsibleSection
            title="Condition"
            icon={<CheckCircle2 className="h-5 w-5" />}
            open={openSections.condition}
            onToggle={() => toggleSection("condition")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="box_condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Mint", "Good (C9)", "Fair (C8)", "Worn", "No Box"].map(c => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="figure_condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Figure Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Mint", "Like New", "Displayed", "Damaged", "Repaired"].map(c => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {category === 'hotwheel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Carded Mint", "Carded Near Mint", "Loose Mint", "Loose Worn"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blister_condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blister / Card Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select blister condition" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Unpunched", "Punched", "None (Loose)"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Media */}
          <CollapsibleSection
            title="Photos & Media"
            icon={<ImageIcon className="h-5 w-5" />}
            open={openSections.media}
            onToggle={() => toggleSection("media")}
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploader 
                        label="Primary Thumbnail Image" 
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gallery_urls"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MultiImageUploader 
                        label="Gallery Images" 
                        value={field.value || []} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleSection>

          {/* Notes */}
          <CollapsibleSection
            title="Notes"
            icon={<FileText className="h-5 w-5" />}
            open={openSections.notes}
            onToggle={() => toggleSection("notes")}
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any extra details, history, or damage reports..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CollapsibleSection>

          <div className="flex gap-4 pt-6 sticky bottom-4 z-10 bg-background/80 backdrop-blur-sm p-4 border rounded-xl shadow-lg">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-coral hover:bg-coral/90" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Update Collectible" : "Add to Vault"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, open, onToggle }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle} className="border rounded-xl bg-card overflow-hidden transition-all duration-200">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 font-heading font-bold text-midnight dark:text-white">
            <div className="text-coral bg-coral/10 p-2 rounded-lg">
              {icon}
            </div>
            {title}
          </div>
          {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-0 border-t bg-background/30">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-6"
          >
            {children}
          </motion.div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
