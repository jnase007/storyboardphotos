import { createServiceClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ClientBookViewer } from "@/components/client-book-viewer";

export default async function BookPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("storybooks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  return <ClientBookViewer book={data} />;
}
