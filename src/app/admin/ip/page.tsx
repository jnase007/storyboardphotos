import type { Metadata } from "next";
import { IPBible } from "@/components/admin/ip-bible";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "IP Bible (Internal)",
  description: "Internal IP bible for Storybook Photos.",
  path: "/admin/ip",
  noIndex: true,
});

export default function IPPage() {
  return <IPBible />;
}
