import { redirect } from "next/navigation";

/** Old URL → unified Business Plan hub */
export default function CostBreakdownPage() {
  redirect("/business-plan?tab=costs");
}
