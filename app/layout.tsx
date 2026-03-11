import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Gem Inventory Management System",
  description: "Professional gemstone inventory tracking and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Hope UI — Library / Plugin CSS */}
        <link rel="stylesheet" href="/hopeui/css/core/libs.min.css" />
        {/* Hope UI Design System */}
        <link rel="stylesheet" href="/hopeui/css/hope-ui.min.css" />
        {/* Hope UI Custom overrides */}
        <link rel="stylesheet" href="/hopeui/css/custom.min.css" />
        {/* Hope UI Dark mode support */}
        <link rel="stylesheet" href="/hopeui/css/dark.min.css" />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
        {/* Hope UI — Bootstrap + Core libs */}
        <script src="/hopeui/js/core/libs.min.js"></script>
        {/* Hope UI — External plugins */}
        <script src="/hopeui/js/core/external.min.js"></script>
        {/* Hope UI — Main script (sidebar toggle, settings, etc.) */}
        <script src="/hopeui/js/hope-ui.js" defer></script>
      </body>
    </html>
  );
}
