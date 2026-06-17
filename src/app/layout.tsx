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
  metadataBase: new URL("https://givemesometokens.dev"),
  title: {
    default: "GiveMeSomeTokens — Support creators with AI tokens",
    template: "%s — GiveMeSomeTokens",
  },
  description:
    "Fund AI creators with Claude, GPT, Gemini, Grok, Mistral, DeepSeek, and more tokens instead of money. Think BuyMeACoffee — but the currency is API credits.",
  keywords: [
    "AI tokens",
    "support creators",
    "API credits",
    "Claude",
    "GPT",
    "Gemini",
    "BuyMeACoffee alternative",
    "AI funding",
  ],
  authors: [{ name: "GiveMeSomeTokens" }],
  creator: "GiveMeSomeTokens",
  publisher: "GiveMeSomeTokens",
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    title: "GiveMeSomeTokens",
    description: "Support creators with AI tokens instead of money.",
    url: "https://givemesometokens.dev",
    siteName: "GiveMeSomeTokens",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GiveMeSomeTokens — Support creators with AI tokens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiveMeSomeTokens",
    description: "Support creators with AI tokens instead of money.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
      </head>
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
