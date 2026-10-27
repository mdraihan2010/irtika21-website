import type { Metadata } from "next";
import { RegisterFlow } from "@/components/register-flow";

export const metadata: Metadata = { title: "রেজিস্ট্রেশন · Registration" };

export default function Page() {
  return <RegisterFlow />;
}
