import { ProductClient } from "./ProductClient";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Product · DriveLink",
  description: "The DriveLink three-layer system — on-vehicle module, drv-mesh intent protocol, and intelligence layer — plus a live in-browser V2V traffic simulation.",
  path: "/product",
});

export default function ProductRoute() {
  return <ProductClient />;
}
