import type React from "react";
import { getMasterCategories } from "@/lib/server/tricks-data-server";
import { CategoriesSearch } from "@/components/categories-search";
import type { MasterCategory } from "@/lib/types/database";

export default async function CategoriesPage() {
  let categories: MasterCategory[] = [];

  try {
    categories = await getMasterCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
    // For SSR, we'll return empty array on error and let the client component handle the empty state
  }

  return <CategoriesSearch categories={categories} />;
}
