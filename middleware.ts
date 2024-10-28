import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/libs/supabase/middleware";
import UAParser from "ua-parser-js";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Check if the request is for the short link path
  if (url.pathname.startsWith("/s/")) {
    return handleShortLink(request, url);
  }

  // For all other requests, update the session
  return await updateSession(request);
}

async function handleShortLink(request: NextRequest, url: URL) {
  const shortCode = url.pathname.split("/")[2];
  console.log("Handling short link request for:", shortCode);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  try {
    const linkData = await fetchLinkData(supabase, shortCode);
    if (!linkData) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/404`);
    }

    const clickParams = prepareClickParams(request, linkData);
    await recordClick(supabase, clickParams);

    // Redirect to the original URL
    return NextResponse.redirect(linkData.original_url);
  } catch (error) {
    console.error("Unexpected error in middleware:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }
}

async function fetchLinkData(supabase: any, shortCode: string) {
  const { data, error } = await supabase
    .from("shortened_links")
    .select("id, original_url, clicks")
    .eq("short_code", shortCode)
    .single();

  if (error) {
    console.error("Error fetching shortened link:", error);
    return null;
  }

  if (!data) {
    console.log("No data found for short code:", shortCode);
    return null;
  }

  console.log("Original URL found:", data.original_url);
  console.log("Current click count:", data.clicks);

  return data;
}

function prepareClickParams(request: NextRequest, linkData: any) {
  const parser = new UAParser(request.headers.get("user-agent"));
  const deviceType = parser.getDevice().type || "unknown";
  const os = parser.getOS().name || "unknown";
  const browser = parser.getBrowser().name || "unknown";

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  console.log("IP Address detection:", {
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
    "request.ip": request.ip,
    detected_ip: ip,
  });

  return {
    p_link_id: linkData.id,
    p_referrer: request.headers.get("referer") || null,
    p_ip_address: ip,
    p_user_agent: request.headers.get("user-agent") || null,
    p_device_type: deviceType,
    p_operating_system: os,
    p_browser: browser,
    p_click_type: "direct",
    p_latitude: null,
    p_longitude: null,
  };
}

async function recordClick(supabase: any, clickParams: any) {
  console.log("Attempting to record click with dynamic values");
  console.log("Function parameters:", clickParams);

  const { data: clickData, error: clickError } = await supabase.rpc(
    "increment_clicks",
    clickParams
  );

  if (clickError) {
    console.error("Error recording click:", clickError);
    console.error("Error details:", JSON.stringify(clickError, null, 2));
  } else {
    console.log("Click recorded successfully");
    console.log("Click data:", clickData);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
