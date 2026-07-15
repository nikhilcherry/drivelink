import { TeamClient } from "./TeamClient";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Team · DriveLink",
  description: "Meet the DriveLink founders, core team, and mentors building the V2V communication backbone for automotive AI.",
  path: "/team",
});

export default function TeamRoute() {
  return <TeamClient />;
}
