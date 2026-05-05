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

    const { itemId } = await request.json();

    if (!itemId) {
      return new NextResponse("Missing itemId", { status: 400 });
    }

    const service = serviceClient();

    // 1. Fetch item to get image URLs before deletion
    const { data: item } = await service
      .from("collectibles")
      .select("image_url, gallery_urls")
      .eq("id", itemId)
      .single();

    if (item) {
      const pathsToDelete: string[] = [];
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

      if (pathsToDelete.length > 0) {
        await service.storage.from("collectible-images").remove(pathsToDelete);
      }
    }

    // 2. Delete item from DB
    const { error } = await service.from("collectibles").delete().eq("id", itemId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
