import { CollectibleForm } from "@/components/forms/collectible-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AddItemPage() {
  return (
    <div className="py-6">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-coral" /></div>}>
        <CollectibleForm />
      </Suspense>
    </div>
  );
}
