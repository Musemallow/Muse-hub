import type { Metadata } from "next";
import ThemeProvider from "../components/theme/ThemeProvider";
import ThemeToggle from "../components/theme/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseHub",
  description: "Welcome to The Forest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
