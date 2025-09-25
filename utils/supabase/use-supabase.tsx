"use client";

import { createClient } from "./client";
import { createContext, useContext } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

// Single shared client instance for all client components
const client = createClient();

const SupabaseContext = createContext<SupabaseClient>(client);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
