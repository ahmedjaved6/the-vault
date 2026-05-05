import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. If user is NOT logged in and trying to access the app (root) or admin
  if (!user && (path === "/" || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 2. If user IS logged in and trying to access auth pages (except callback)
  const isAuthPage = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/magic-link",
  ].includes(path);
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Admin protection
  if (path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/magic-link",
    "/admin/:path*",
  ],
};
