import type { Metadata } from "next";
import { VideoJobsPanel } from "@/components/admin/video-jobs";

export const metadata: Metadata = {
  title: "Animated Movie Queue | Storybook Photos Admin",
  robots: { index: false, follow: false },
};

export default function VideoJobsPage() {
  return <VideoJobsPanel />;
}
