import FingerprintJS from "@fingerprintjs/fingerprintjs";
import Cookies from "js-cookie";
import { UAParser } from "ua-parser-js";

interface VisitorData {
  visitorId: string;
  sessionId: string;
}

let visitorId: string | null = null;

export async function getVisitorData(): Promise<VisitorData> {
  // Get or generate visitor ID (persistent)
  if (!visitorId) {
    visitorId = localStorage.getItem("visitorId");

    if (!visitorId) {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      visitorId = result.visitorId;
      localStorage.setItem("visitorId", visitorId);
    }
  }

  // Get or generate session ID (temporary)
  let sessionId = Cookies.get("sessionId");
  if (!sessionId) {
    sessionId = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    // Set session cookie to expire in 30 minutes
    Cookies.set("sessionId", sessionId, {
      expires: new Date(new Date().getTime() + 30 * 60 * 1000),
      sameSite: "strict",
    });
  }

  return { visitorId, sessionId };
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const parsedResult = parser.getResult();

  return {
    browser: parsedResult.browser.name || "unknown",
    operatingSystem: parsedResult.os.name || "unknown",
    deviceType: getDeviceType(parsedResult),
  };
}

function getDeviceType(parsedResult: UAParser.IResult): string {
  const deviceType = parsedResult.device.type;
  const cpuArchitecture = parsedResult.cpu.architecture;

  if (deviceType) {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return "Smartphone";
      case "tablet":
        return "Tablet";
      case "console":
        return "Gaming Console";
      case "smarttv":
        return "Smart TV";
      case "wearable":
        return "Wearable Device";
      case "embedded":
        return "Embedded Device";
    }
  }

  if (parsedResult.os.name) {
    const osName = parsedResult.os.name.toLowerCase();
    if (
      osName.includes("android") ||
      osName.includes("ios") ||
      osName.includes("windows phone")
    ) {
      return "Smartphone";
    }
    if (
      osName.includes("windows") ||
      osName.includes("mac") ||
      osName.includes("linux")
    ) {
      return cpuArchitecture === "arm" ? "Tablet" : "Desktop";
    }
  }

  return "Unknown";
}
