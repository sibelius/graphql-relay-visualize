import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { RelayProvider } from "@/relay/RelayProvider";
import { MobileNav, Sidebar } from "@/components/shell/Sidebar";
import { DevDrawer } from "@/components/shell/DevDrawer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb" });

export const metadata: Metadata = {
  title: "Relay, visualized",
  description: "Interactive visualizations of what GraphQL and Relay do for a React app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <RelayProvider>
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <MobileNav />
              <main className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-8">{children}</main>
            </div>
          </div>
          <DevDrawer />
        </RelayProvider>
      </body>
    </html>
  );
}
