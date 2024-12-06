export function generateQRCodeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid URL provided");
  }

  // The URL already contains the short code, so we don't need to modify it
  return url;
}
