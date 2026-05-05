import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if requester is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Use service client to update role (bypass RLS)
    const service = serviceClient();
    const { error } = await service
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
