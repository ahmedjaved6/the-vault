import { serviceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import { ItemCard } from "@/components/collectors/item-card";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminUserCollectionPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = serviceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const { data: items } = await supabase
    .from("collectibles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">
              {profile.full_name || profile.username}'s Collection
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              Viewing as System Admin (Read-only)
            </p>
          </div>
        </div>
      </div>

      {items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed text-center">
          <p className="text-muted-foreground">This user has no collectibles in their vault yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items?.map((item: any) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
