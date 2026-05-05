"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon, PlusCircle } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { supabase } = useSupabase();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF, SVG.`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("collectible-images")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("collectible-images")
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      console.error("Error uploading image:", error.message);
    } finally {
      setIsUploading(false);
    }
  }, [supabase, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-all",
        value ? "bg-muted/50" : "hover:border-coral/50 hover:bg-muted/30"
      )}>
        {value ? (
          <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border shadow-sm">
            <Image src={value} alt="Preview" fill sizes="200px" className="object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 rounded-full"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-coral" />
            ) : (
              <>
                <div className="mb-2 rounded-full bg-muted p-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Click or drag to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
            <input
              type="file"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleUpload}
              accept="image/*"
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
}

export function MultiImageUploader({ value, onChange, label }: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { supabase } = useSupabase();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      if (allowedTypes.includes(files[i].type)) {
        validFiles.push(files[i]);
      } else {
        toast.error(`Skipped unsupported file: ${files[i].name}`);
      }
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [...value];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      for (const file of validFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("collectible-images")
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("collectible-images")
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }
      onChange(newUrls);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      console.error("Error uploading images:", error.message);
    } finally {
      setIsUploading(false);
    }
  }, [supabase, value, onChange]);

  const removeImage = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-md border bg-muted shadow-sm group">
            <Image src={url} alt={`Preview ${index}`} fill sizes="(max-width: 640px) 50vw, 150px" className="object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="relative aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-coral/50 hover:bg-muted/30 transition-all cursor-pointer">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-coral" />
          ) : (
            <>
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] mt-1 text-muted-foreground">Add More</span>
            </>
          )}
          <input
            type="file"
            multiple
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleUpload}
            accept="image/*"
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}

