import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DriveLink | Future of Autonomous Mobility",
  description: "DriveLink is pioneering the future of autonomous vehicle communication and data sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
