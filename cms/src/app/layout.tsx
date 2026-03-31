import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Finca La Habanera",
    template: "%s | Finca La Habanera"
  },
  description: "Finca Caprina La Habanera - Productos lácteos caprinos de calidad en Mayabeque, Cuba. Turismo rural, degustación de productos y experiencia caprina única.",
  keywords: ["Finca La Habanera", "productos caprinos", "queso de cabra", "turismo rural Cuba", "Mayabeque", "leche de cabra", "queso artesanal"],
  authors: [{ name: "Finca La Habanera" }],
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
  openGraph: {
    title: "Finca La Habanera - Finca Caprina",
    description: "Productos lácteos caprinos nutritivos y de alta calidad, promoviendo el bienestar animal y el desarrollo comunitario.",
    url: "https://lahabanera.com",
    siteName: "Finca La Habanera",
    type: "website",
    images: [
      {
        url: "/Logo.png",
        width: 512,
        height: 512,
        alt: "Finca La Habanera Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finca La Habanera - Finca Caprina",
    description: "Productos lácteos caprinos de calidad en Mayabeque, Cuba",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://lahabanera.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}