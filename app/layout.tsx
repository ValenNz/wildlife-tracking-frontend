import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { VoiceA11yWidget } from "@/components/accessibility/voice-a11y-widget";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wildlife Monitoring System - BTNGL",
  description:
    "Sistem pelacakan pergerakan satwa liar untuk Balai Taman Nasional Gunung Leuser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a2e" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1410" },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

const COLOR_SCHEME_INIT_SCRIPT =
  'try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark")document.querySelector(\'meta[name="color-scheme"]\').content=s;var l=localStorage.getItem("app-locale");if(l==="en"||l==="id")document.documentElement.lang=l;}catch(e){}';

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="id"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <PreferencesProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
              <VoiceA11yWidget />
            </ToastProvider>
          </QueryProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
