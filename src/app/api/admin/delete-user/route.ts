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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const service = serviceClient();

    // 1. Delete user collectibles images from storage
    const { data: items } = await service
      .from("collectibles")
      .select("image_url, gallery_urls")
      .eq("user_id", userId);

    if (items) {
      const pathsToDelete: string[] = [];
      items.forEach(item => {
        if (item.image_url) {
          const path = item.image_url.split("/storage/v1/object/public/collectible-images/")[1];
          if (path) pathsToDelete.push(path);
        }
        if (item.gallery_urls) {
          item.gallery_urls.forEach((url: string) => {
            const path = url.split("/storage/v1/object/public/collectible-images/")[1];
            if (path) pathsToDelete.push(path);
          });
        }
      });

      if (pathsToDelete.length > 0) {
        await service.storage.from("collectible-images").remove(pathsToDelete);
      }
    }

    // 2. Delete user from Auth (cascades to profiles and collectibles)
    const { error } = await service.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
