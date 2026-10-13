import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ApiClientProvider } from "@/src/lib/ApiClientProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insurance Policy Portal",
  description: "Securely access and manage your insurance policy information.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiClientProvider>{children}</ApiClientProvider>
      </body>
    </html>
  );
}