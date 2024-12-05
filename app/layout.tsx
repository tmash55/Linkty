import { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={config.colors.theme}
          enableSystem
        >
          <ClientLayout>
            {children}
            <Toaster />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
