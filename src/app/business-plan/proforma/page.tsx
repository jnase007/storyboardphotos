import { redirect } from "next/navigation";

/** Old URL → unified Business Plan hub */
export default function ProformaPage() {
  redirect("/business-plan?tab=proforma");
}
