import { redirect, notFound } from "next/navigation";

import { CreateHubForm } from "@/components/create-hub-form";
import { supabase } from "@/lib/supbase";

interface EditHubPageProps {
  params: { id: string };
}

export default async function EditHubPage({ params }: EditHubPageProps) {
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
