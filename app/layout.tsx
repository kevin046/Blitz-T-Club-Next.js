import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./components.css";
import "./footer.css";
import "./hero.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import JotformAI from "@/components/JotformAI";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: "Blitz T Club - Tesla Enthusiasts Community",
  description: "Join the premier Tesla owners club for exclusive events, meetups, and member benefits.",
  icons: {
    icon: "https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png",
    apple: "https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link key="fontawesome" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link key="fonts-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="fonts-gstatic" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link key="fonts-stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            {children}
            <Footer />
            <JotformAI />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
