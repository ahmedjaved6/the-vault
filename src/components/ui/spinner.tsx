import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin text-coral", className)} />
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <Spinner className="h-12 w-12" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-coral/10" />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">Loading Vault Data...</p>
    </div>
  );
}
