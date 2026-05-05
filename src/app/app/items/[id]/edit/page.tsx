import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CollectibleForm } from "@/components/forms/collectible-form";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("collectibles")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  return (
    <div className="py-10">
      <CollectibleForm initialData={item} isEdit />
    </div>
  );
}
