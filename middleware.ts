import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { updateSession } from "@/libs/supabase/middleware";
import { parseUserAgent } from "./libs/visitorId";
import { geolocation } from "@vercel/functions";

interface ClickParams {
  p_link_id: string;
  p_referrer: string | null;
  p_ip_address: string;
  p_user_agent: string;
  p_device_type: string;
  p_operating_system: string;
  p_browser: string;
  p_click_type: string;
  p_latitude: number | null;
  p_longitude: number | null;
  p_visitor_id: string;
  p_country: string | null;
  p_city: string | null;
  p_is_qr_scan: boolean;
}

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
  const isQRScan = url.searchParams.has("qr");
  console.log(
    `Handling ${isQRScan ? "QR code" : "short link"} request for:`,
    shortCode
  );

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
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
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
    const { data: linkData, error: linkError } = await supabase
      .from("shortened_links")
      .select("id, original_url")
      .eq("short_code", shortCode)
      .single();

    if (linkError || !linkData) {
      console.error(`Link not found for short code: ${shortCode}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/404`);
    }

    // Get visitor and session IDs from cookies
    let visitorId = request.cookies.get("visitorId")?.value;
    let sessionId = request.cookies.get("sessionId")?.value;

    // Generate new session ID if none exists
    if (!sessionId) {
      sessionId = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      response.cookies.set("sessionId", sessionId, {
        maxAge: 30 * 60, // 30 minutes
        path: "/",
        sameSite: "strict",
      });
    }

    // Generate new visitor ID if none exists
    if (!visitorId) {
      visitorId = `v-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      response.cookies.set("visitorId", visitorId, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: "/",
        sameSite: "strict",
      });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const { browser, operatingSystem, deviceType } = parseUserAgent(userAgent);
    const referrerInfo = getReferrerInfo(request.headers.get("referer"));
    const geo = geolocation(request);
    console.log("Geolocation data:", JSON.stringify(geo, null, 2));

    const clickParams: ClickParams = {
      p_link_id: linkData.id,
      p_referrer: referrerInfo.url,
      p_ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.ip ||
        "unknown",
      p_user_agent: userAgent,
      p_device_type: deviceType,
      p_operating_system: operatingSystem,
      p_browser: browser,
      p_click_type: isQRScan ? "qr_scan" : referrerInfo.type,
      p_latitude: geo.latitude ? parseFloat(geo.latitude) : null,
      p_longitude: geo.longitude ? parseFloat(geo.longitude) : null,
      p_visitor_id: visitorId,
      p_country: geo.country || null,
      p_city: geo.city || null,
      p_is_qr_scan: isQRScan,
    };

    console.log(`Processing link: ${shortCode}, QR Scan: ${isQRScan}`);
    console.log(`Click parameters: ${JSON.stringify(clickParams, null, 2)}`);

    // Record click and update visitor count
    const { data: clickData, error: clickError } = await supabase.rpc(
      "insert_link_click",
      clickParams
    );

    if (clickError) {
      console.error(
        `Error recording click for ${shortCode}:`,
        JSON.stringify(clickError, null, 2)
      );
    } else {
      console.log(
        `Click recorded successfully for ${shortCode}:`,
        JSON.stringify(clickData, null, 2)
      );
    }

    // Manage visitor session separately
    const { error: sessionError } = await supabase.rpc(
      "manage_visitor_session",
      {
        p_link_id: linkData.id,
        p_visitor_id: visitorId,
        p_session_id: sessionId,
        p_browser: browser,
        p_operating_system: operatingSystem,
        p_device_type: deviceType,
        p_ip_address: clickParams.p_ip_address,
        p_referrer: clickParams.p_referrer,
      }
    );

    if (sessionError) {
      console.error("Error managing visitor session:", sessionError);
    } else {
      console.log("Visitor session managed successfully");
    }

    // Create redirect response
    const redirectResponse = NextResponse.redirect(linkData.original_url, 302);

    // Copy cookies to redirect response
    redirectResponse.cookies.set("sessionId", sessionId, {
      maxAge: 30 * 60,
      path: "/",
      sameSite: "strict",
    });
    redirectResponse.cookies.set("visitorId", visitorId, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "strict",
    });

    console.log(`Redirecting to: ${linkData.original_url}`);
    return redirectResponse;
  } catch (error) {
    console.error(`Unexpected error for ${shortCode}:`, error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }
}

function getReferrerInfo(referrer: string | null): {
  type: string;
  url: string | null;
} {
  if (!referrer) return { type: "direct", url: null };

  try {
    const referrerUrl = new URL(referrer);
    const referrerHostname = referrerUrl.hostname.toLowerCase();

    // Define known referrer types
    const knownReferrers: { [key: string]: string[] } = {
      search_engine: ["google", "bing", "yahoo", "duckduckgo", "baidu"],
      social_media: [
        "facebook",
        "twitter",
        "linkedin",
        "instagram",
        "pinterest",
        "tiktok",
      ],
      video_platform: ["youtube", "vimeo", "dailymotion"],
      email: ["gmail", "outlook", "yahoo", "protonmail"],
    };

    // Check if the referrer matches any known type
    for (const [type, domains] of Object.entries(knownReferrers)) {
      if (domains.some((domain) => referrerHostname.includes(domain))) {
        return { type, url: referrer };
      }
    }

    // If no match found, return the referrer as 'other' with the full URL
    return { type: "other", url: referrer };
  } catch (error) {
    console.error("Error parsing referrer URL:", error);
    return { type: "invalid", url: referrer };
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
