import type { Metadata } from "next";
import { DeskClient } from "./DeskClient";

export const metadata: Metadata = {
  title: "Hiring desk · DriveLink",
  // Internal tool. Kept out of search results and out of sitemap.ts — the
  // password is the security boundary, not the obscurity of the URL, but
  // there's no reason to advertise it either.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function DeskRoute() {
  return <DeskClient />;
}
