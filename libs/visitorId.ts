import FingerprintJS from "@fingerprintjs/fingerprintjs";

let visitorId: string | null = null;

export async function getVisitorId(): Promise<string> {
  if (visitorId) return visitorId;

  // Check if we have a stored visitor ID
  const storedVisitorId = localStorage.getItem("visitorId");
  if (storedVisitorId) {
    visitorId = storedVisitorId;
    return visitorId;
  }

  // If not, generate a new one
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  visitorId = result.visitorId;

  // Store the new visitor ID
  localStorage.setItem("visitorId", visitorId);

  return visitorId;
}
