import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { SiteChrome, SiteFooter } from "@/components/layout/site-chrome";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: {
    default: "Maison — Modern Luxury Furniture",
    template: "%s | Maison",
  },
  description:
    "Considered furniture for the modern home. Sofas, dining, bedroom and decor crafted from natural materials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, fraunces.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteChrome />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
