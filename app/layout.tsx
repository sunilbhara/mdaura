import type { Metadata, Viewport } from "next";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { DocumentProvider } from "@/components/DocumentStore";
import "./globals.css";
import "./document.css";

export const metadata: Metadata = {
  title: "MDAura — Give your Markdown an aura",
  description:
    "Turn any Markdown file into a navigable, presentation-grade document with living diagrams. Free and open source. Your files never leave your browser.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#05070a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Fraunces:opsz,wght@9..144,400..600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <DocumentProvider>{children}</DocumentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
