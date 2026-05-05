import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-midnight dark:text-white">Collectible not found</h2>
      <p className="text-muted-foreground text-center max-w-xs">
        The item you're looking for doesn't exist or was deleted from your vault.
      </p>
      <Link 
        href="/app" 
        className="text-coral hover:text-coral/80 underline underline-offset-4 font-medium"
      >
        Back to collection
      </Link>
    </div>
  );
}
