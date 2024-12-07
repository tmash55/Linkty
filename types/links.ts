export type ShortenedLink = {
  id: string;
  original_url: string;
  short_code: string;
  created_at: string;
  total_clicks: number;
  domain: string | null;
  qr_settings?: QRCodeSettings;
};

export type QRCodeSettings = {
  bgColor: string;
  fgColor: string;
  logoUrl?: string;
  logoSize?: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
};
export type SortField = "created_at" | "total_clicks";
