import { TrickipediaLayoutServer } from "./layout-server";
import { TrickipediaFooter } from "@/components/trickipdedia-footer";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <TrickipediaLayoutServer>
      {children}
      <TrickipediaFooter />
    </TrickipediaLayoutServer>
  );
}
