import type { Metadata } from "next";
import { ShopFlow } from "@/components/shop-flow";

export const metadata: Metadata = { title: "শপ · Shop" };

export default function Page() {
  return <ShopFlow />;
}
