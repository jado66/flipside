import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/create-event-form";

export default async function CreateEventPage() {
  // const user = await getUser();

  // if (!user) {
  //   redirect("/login");
  // }

  //
  // const { data: profile } = await supabase
  //   .from("users")
  //   .select("role")
  //   .eq("id", user.id)
  //   .single();

  // if (profile?.role !== "business") {
  //   redirect("/events")
  // }

  return <CreateEventForm />;
}
