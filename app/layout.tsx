import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "NewFed Campaign Builder",
  description: "Create personalized email journeys in minutes",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
