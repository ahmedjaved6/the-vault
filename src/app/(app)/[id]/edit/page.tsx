"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CollectibleForm } from "@/components/forms/collectible-form";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";

import { Suspense } from "react";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/");
        return;
      }

      setItem(data);
      setLoading(false);
    }

    fetchItem();
  }, [id, supabase, session, router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-coral" /></div>}>
        <CollectibleForm initialData={item} isEdit={true} />
      </Suspense>
    </div>
  );
}
