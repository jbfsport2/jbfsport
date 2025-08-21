import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/header";
import Footer from "./components/Footer";
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
  title: "JBF Sport",
  description: "JBF Sport votre revendeur de matériel sportif sur tout le territoire de la Corse",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [
      {
        url: "/favicon.ico",
      },
    ],
    title: "JBF Sport",
    description: "JBF Sport votre revendeur de matériel sportif sur tout le territoire de la Corse",
    url: "https://www.jbfsport.com",
    siteName: "JBF Sport",
    locale: "fr_FR",
    type: "website",

  },
  twitter: {
    card: "summary_large_image",
    title: "JBF Sport",
    description: "JBF Sport votre revendeur de matériel sportif sur tout le territoire de la Corse",
    images: ["/favicon.ico"],
  },
  alternates: {
    canonical: "https://www.jbfsport.com",
  },
  robots: { 
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
