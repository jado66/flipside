import { GymProvider } from "@/contexts/gym/gym-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "../gym-themes.css";
import "../globals.css";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="trickipedia"
      enableSystem={false}
      disableTransitionOnChange
      value={{
        trickipedia: "trickipedia",
        dark: "dark",
        "iron-forge": "iron-forge",
        "iron-forge-dark": "iron-forge.dark",
        "energy-rush": "energy-rush",
        "energy-rush-dark": "energy-rush.dark",
        "ocean-depths": "ocean-depths",
        "ocean-depths-dark": "ocean-depths.dark",
        "sunset-power": "sunset-power",
        "sunset-power-dark": "sunset-power.dark",
      }}
    >
      <GymProvider>{children}</GymProvider>
    </ThemeProvider>
  );
}
