import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import { CreateHubForm } from "@/components/create-hub-form";

interface EditHubPageProps {
  params: { id: string };
}

export default async function EditHubPage({ params }: EditHubPageProps) {
  const supabase = await createClient();
  const { data: hub, error } = await supabase
    .from("hubs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !hub) {
    notFound();
  }

  // Pass hub data as prop to form for editing
  return <CreateHubForm initialData={hub} isEdit />;
}
