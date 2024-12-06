export function generateQRCodeUrl(shortUrl: string): string {
  // Ensure the shortUrl is a full URL
  const fullUrl = new URL(
    shortUrl,
    process.env.NEXT_PUBLIC_SITE_URL
  ).toString();
  // Append the qr=true parameter to the URL
  return `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}qr=true`;
}
