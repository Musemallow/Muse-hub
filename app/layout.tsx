import type { Metadata } from "next";
import ChatDock from "../components/ChatDock";
import MessageBell from "../components/MessageBell";
import ThemeProvider from "../components/theme/ThemeProvider";
import ThemeToggle from "../components/theme/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseHub",
  description: "Welcome to The Forest",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
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
          <MessageBell />
          <ChatDock />
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
