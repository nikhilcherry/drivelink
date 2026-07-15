import { InvestorsClient } from "./InvestorsClient";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Investors · DriveLink",
  description: "DriveLink's traction, seed round, and the case for a decentralized V2V communication protocol as its own category — not just a feature.",
  path: "/investors",
});

export default function InvestorsRoute() {
  return <InvestorsClient />;
}
