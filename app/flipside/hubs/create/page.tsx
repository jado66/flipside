import { redirect } from "next/navigation";
// import { getUser } from "@/lib/auth";
import { CreateHubForm } from "@/components/create-hub-form";
//

export default async function CreateHubPage() {
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
  //   redirect("/hubs")
  // }

  return <CreateHubForm />;
}
