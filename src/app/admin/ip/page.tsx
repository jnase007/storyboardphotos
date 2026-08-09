import { redirect } from "next/navigation";

/** IP Bible lives inside Business Plan hub now. */
export default function IPPage() {
  redirect("/business-plan?tab=ip");
}
