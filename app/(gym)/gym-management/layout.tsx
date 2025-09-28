import { GymProvider } from "@/contexts/gym-provider";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return <GymProvider>{children}</GymProvider>;
}
