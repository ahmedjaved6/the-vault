import { serviceClient } from "@/lib/supabase/service";
import { ItemsTable } from "./items-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminItemsPage() {
  const supabase = serviceClient();

  // 1. Fetch all collectibles with profiles join
  // Note: Since we are using service role, we can join profiles easily
  const { data: items, error } = await supabase
    .from("collectibles")
    .select(`
      *,
      profiles:user_id (
        email,
        username,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">Item Moderation</h1>
        <p className="text-muted-foreground mt-1">Global view of all collectibles across the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Inventory ({items?.length || 0})</CardTitle>
          <CardDescription>Monitor content and moderate items if necessary.</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsTable initialItems={items || []} />
        </CardContent>
      </Card>
    </div>
  );
}
