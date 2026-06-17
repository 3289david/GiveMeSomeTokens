import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "GiveMeSomeTokens — Support creators with AI tokens",
  description: "Fund creators with AI tokens instead of money. Support with Claude, GPT, Gemini, and more.",
  openGraph: {
    title: "GiveMeSomeTokens",
    description: "Support creators with AI tokens instead of money.",
    url: "https://givemesometokens.dev",
    siteName: "GiveMeSomeTokens",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
