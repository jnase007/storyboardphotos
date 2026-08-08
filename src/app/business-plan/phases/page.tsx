import { redirect } from "next/navigation";

/** Old URL → unified Business Plan hub */
export default function PhaseDecisionPage() {
  redirect("/business-plan?tab=phases");
}
