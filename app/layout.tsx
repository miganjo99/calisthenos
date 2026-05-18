import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LiveNotifications from "@/components/LiveNotifications";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calisthenos | Domina tu cuerpo",
  description: "Entrenamiento libre guiado y comunidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebasNeue.variable} font-sans bg-canvas text-ink antialiased`}
        suppressHydrationWarning 
      >
        <Navbar />
        <LiveNotifications />
        {children}
      </body>
    </html>
  );
}
