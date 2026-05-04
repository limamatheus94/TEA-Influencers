import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { fontSans, fontHeading, fontAccent, fontMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curator Marketplace — TEA Global Media",
  description: "Connect music curators with labels and artists",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html
        lang="pt-BR"
        className={`${fontSans.variable} ${fontHeading.variable} ${fontAccent.variable} ${fontMono.variable} h-full antialiased`}
      >
        <body className="bg-background text-foreground min-h-full flex flex-col font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
