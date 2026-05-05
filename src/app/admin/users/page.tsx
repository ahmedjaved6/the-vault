import { serviceClient } from "@/lib/supabase/service";
import { UsersTable } from "./users-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const supabase = serviceClient();

  // 1. Fetch Profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch Auth Users (to get email and last_sign_in)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // 3. Fetch Item Counts per user
  // We can do this with an aggregate query if we had one, or a separate fetch
  const { data: itemsData } = await supabase.from("collectibles").select("user_id");
  const itemCounts = itemsData?.reduce((acc: any, item) => {
    acc[item.user_id] = (acc[item.user_id] || 0) + 1;
    return acc;
  }, {}) || {};

  // 4. Merge Data
  const users = profiles?.map(profile => {
    const authUser = authUsers.find(u => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email,
      last_sign_in_at: authUser?.last_sign_in_at,
      total_items: itemCounts[profile.id] || 0
    };
  }) || [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-midnight dark:text-white">User Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage collector accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collectors ({users.length})</CardTitle>
          <CardDescription>View and manage permissions for all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
