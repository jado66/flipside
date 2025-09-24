// app/dashboard/page.tsx
import { UserDashboard } from "@/components/user-dashboard/user-dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-auth-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Double-check authentication on the server side
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // This shouldn't happen due to middleware, but good to have as a fallback
  if (!user || error) {
    redirect("/");
  }

  return (
    <main>
      <section className="w-full flex flex-col items-center py-8 lg:px-4">
        <div className="container mx-auto lg:px-4">
          <UserDashboard />
        </div>
      </section>
    </main>
  );
}
