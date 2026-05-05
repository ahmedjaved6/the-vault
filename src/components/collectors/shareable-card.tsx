"use client";

import { useRef } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import { Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShareableCardProps {
  item: any;
}

export function ShareableCard({ item }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    
    const toastId = toast.loading("Generating image...");
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      
      const link = document.createElement("a");
      link.download = `vault-${item.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!", { id: toastId });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to generate image", { id: toastId });
    }
  };

  const properties = item.properties || {};

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card Container for Export */}
      <div 
        ref={cardRef} 
        className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white shadow-2xl border-8 border-white group"
      >
        {/* Background Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-transparent to-teal/20 pointer-events-none" />
        
        {/* Main Image */}
        <div className="absolute inset-0">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Share2 className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent flex flex-col justify-end p-8">
          <Badge className="w-fit mb-3 bg-coral hover:bg-coral border-none">
            {item.category.toUpperCase()}
          </Badge>
          <h1 className="text-3xl font-heading font-bold text-white mb-2 leading-tight">
            {item.name}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-white/80 text-sm mb-4">
            {item.category === "hotwheel" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase opacity-60 tracking-wider font-bold">Series</span>
                  <span className="font-medium">{properties.series || "Hot Wheels"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase opacity-60 tracking-wider font-bold">Year</span>
                  <span className="font-medium">{properties.year || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase opacity-60 tracking-wider font-bold">Scale</span>
                  <span className="font-medium">{properties.scale || "1:64"}</span>
                </div>
              </>
            ) : (
              <>
                {properties.art_style && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-60 tracking-wider font-bold">Art Style</span>
                    <span className="font-medium">{properties.art_style}</span>
                  </div>
                )}
                {properties.pose && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-60 tracking-wider font-bold">Pose</span>
                    <span className="font-medium">{properties.pose}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">
              Shared from <span className="text-coral">The Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={copyLink} 
          variant="outline" 
          className="rounded-2xl h-14 font-bold border-2"
        >
          <Copy className="mr-2 h-5 w-5" />
          Copy Link
        </Button>
        <Button 
          onClick={downloadImage}
          className="rounded-2xl h-14 font-bold bg-midnight text-white hover:bg-midnight/90"
        >
          <Download className="mr-2 h-5 w-5" />
          Download
        </Button>
      </div>
    </div>
  );
}
