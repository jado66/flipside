"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { iconMap } from "./icon-map";
import {
  fetchMasterCategories,
  fetchSubcategoriesByCategory,
  fetchTricksBySubcategory,
} from "@/lib/fetch-tricks";
import type {
  NavigationCategory,
  NavigationSubcategory,
  NavigationTrick,
} from "./types";
import { TrickipediaLogo } from "../trickipedia-logo";
import Link from "next/link";
import { createClient } from "@/lib/client";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";

export function MasterSideNav({
  onItemClick,
}: { onItemClick?: () => void } = {}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
    if (onItemClick) onItemClick();
  };

  // Load initial categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const result = await fetchMasterCategories();

        if (result.success) {
          // Transform the data to match our navigation structure
          const transformedCategories: NavigationCategory[] = result.data.map(
            (category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              icon_name: category.icon_name,
              color: category.color,
              sort_order: category.sort_order,
              subcategories: [],
              subcategoriesLoaded: false,
              subcategoriesLoading: false,
            })
          );

          setCategories(transformedCategories);

          console.log("Categories loaded successfully:", transformedCategories);
          setError(null);
        } else {
          setError(result.error || "Failed to load categories");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load navigation data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Load subcategories and tricks on demand
  const loadSubcategoriesAndTricks = async (
    categorySlug: string,
    subcategorySlug?: string
  ) => {
    if (subcategorySlug) {
      // Load tricks for a specific subcategory
      const categoryIndex = categories.findIndex(
        (c) => c.slug === categorySlug
      );
      if (categoryIndex === -1) return;

      const subcategoryIndex = categories[
        categoryIndex
      ].subcategories?.findIndex((s) => s.slug === subcategorySlug);
      if (subcategoryIndex === -1 || subcategoryIndex === undefined) return;

      // Mark as loading
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].subcategories![
        subcategoryIndex
      ].tricksLoading = true;
      setCategories(updatedCategories);

      try {
        const result = await fetchTricksBySubcategory(subcategorySlug, {
          pageSize: 100,
        });

        if (result.success) {
          // Transform tricks data
          const tricks: NavigationTrick[] = result.data.map((trick) => ({
            id: trick.id,
            name: trick.name,
            slug: trick.slug,
          }));

          // Update state
          const finalCategories = [...categories];
          finalCategories[categoryIndex].subcategories![subcategoryIndex] = {
            ...finalCategories[categoryIndex].subcategories![subcategoryIndex],
            tricks,
            tricksLoaded: true,
            tricksLoading: false,
          };
          setCategories(finalCategories);
        }
      } catch (error) {
        console.error("Failed to load tricks:", error);
        // Reset loading state on error
        const errorCategories = [...categories];
        errorCategories[categoryIndex].subcategories![
          subcategoryIndex
        ].tricksLoading = false;
        setCategories(errorCategories);
      }
    } else {
      // Load subcategories for a category
      const categoryIndex = categories.findIndex(
        (c) => c.slug === categorySlug
      );
      if (categoryIndex === -1) return;

      // Mark as loading
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].subcategoriesLoading = true;
      setCategories(updatedCategories);

      try {
        const result = await fetchSubcategoriesByCategory(categorySlug);

        if (result.success) {
          // Transform subcategories data
          const subcategories: NavigationSubcategory[] = result.data.map(
            (sub) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              sort_order: sub.sort_order,
              tricks: [],
              tricksLoaded: false,
              tricksLoading: false,
            })
          );

          // Update state
          const finalCategories = [...categories];
          finalCategories[categoryIndex] = {
            ...finalCategories[categoryIndex],
            subcategories,
            subcategoriesLoaded: true,
            subcategoriesLoading: false,
          };
          setCategories(finalCategories);
        }

        console.log("Subcategories loaded successfully:", categories);
      } catch (error) {
        console.error("Failed to load subcategories:", error);
        // Reset loading state on error
        const errorCategories = [...categories];
        errorCategories[categoryIndex].subcategoriesLoading = false;
        setCategories(errorCategories);
      }
    }
  };

  // Only allow one master category open at a time
  const toggleExpanded = (id: string, isMasterCategory = false) => {
    if (isMasterCategory) {
      // If already open, close it; else, open only this one
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
          return newSet;
        } else {
          return new Set([id]);
        }
      });
    } else {
      // Subcategory logic: allow multiple subcategories open
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
  };

  return (
    <>
      {/* Desktop spacer for topbar, only visible on desktop */}
      <div className="h-16 hidden sm:block" />

      {/* Mobile logo */}
      <div className="block sm:hidden flex">
        <TrickipediaLogo />
      </div>

      <div className="w-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Mobile-only links above categories */}
                <div className="block sm:hidden">
                  <div className="my-4 border-t border-border" />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        if (onItemClick) onItemClick();
                      }}
                    >
                      <Link
                        href="/sports-and-disciplines"
                        className="w-full text-sm py-2 block"
                      >
                        Sports &amp; Disciplines
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      onClick={() => {
                        if (onItemClick) onItemClick();
                      }}
                    >
                      <Link href="/store" className="w-full text-sm py-2 block">
                        Donate
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem> */}
                  {/* Separator */}
                  <div className="my-2 border-t border-border" />
                </div>

                {/* Categories */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {error}
                  </div>
                ) : (
                  categories.map((category) => {
                    const Icon =
                      iconMap[category.icon_name ?? "circle"] ||
                      iconMap["circle"];
                    const isCategoryExpanded = expandedItems.has(category.slug);
                    return (
                      <SidebarMenuItem key={category.slug}>
                        <SidebarMenuButton
                          asChild
                          onClick={async () => {
                            toggleExpanded(category.slug, true);
                            if (
                              !category.subcategoriesLoaded &&
                              !category.subcategoriesLoading
                            ) {
                              await loadSubcategoriesAndTricks(category.slug);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                            <span className=" truncate">{category.name}</span>
                            {isCategoryExpanded ? (
                              <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                            )}
                          </div>
                        </SidebarMenuButton>
                        {/* Subcategories */}
                        {isCategoryExpanded && (
                          <SidebarMenuSub>
                            {/* Add "All Categories" link if there are more than 3 subcategories */}
                            {!category.subcategoriesLoading &&
                              (category.subcategories?.length ?? 0) > 3 && (
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    asChild
                                    onClick={() => {
                                      if (onItemClick) onItemClick();
                                    }}
                                  >
                                    <Link
                                      href={`/${category.slug}`}
                                      className="text-xs md:text-sm py-1 block font-medium text-primary hover:underline"
                                    >
                                      All Categories
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )}

                            {category.subcategoriesLoading ? (
                              <SidebarMenuSubItem>
                                <div className="flex items-center py-2">
                                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                  <span className="ml-2 text-xs ">
                                    Loading subcategories...
                                  </span>
                                </div>
                              </SidebarMenuSubItem>
                            ) : (category.subcategories?.length ?? 0) === 0 ? (
                              <SidebarMenuSubItem>
                                <div className="text-xs text-muted-foreground py-2 ">
                                  No subcategories
                                </div>
                              </SidebarMenuSubItem>
                            ) : (
                              (category.subcategories ?? []).map((subcat) => {
                                const subcatKey = `${category.slug}:${subcat.slug}`;
                                const isSubcatExpanded =
                                  expandedItems.has(subcatKey);
                                return (
                                  <SidebarMenuSubItem key={subcat.slug}>
                                    <SidebarMenuSubButton
                                      asChild
                                      onClick={async (e: any) => {
                                        e.stopPropagation();
                                        toggleExpanded(subcatKey);
                                        if (
                                          !subcat.tricksLoaded &&
                                          !subcat.tricksLoading
                                        ) {
                                          await loadSubcategoriesAndTricks(
                                            category.slug,
                                            subcat.slug
                                          );
                                        }
                                      }}
                                      isActive={isSubcatExpanded}
                                    >
                                      <div className="flex items-center gap-2 cursor-pointer text-xs md:text-sm py-1">
                                        <span className="truncate">
                                          {subcat.name}
                                        </span>
                                        {isSubcatExpanded ? (
                                          <ChevronDown className="h-2 w-2 md:h-3 md:w-3 ml-1 flex-shrink-0" />
                                        ) : (
                                          <ChevronRight className="h-2 w-2 md:h-3 md:w-3 ml-1 flex-shrink-0" />
                                        )}
                                      </div>
                                    </SidebarMenuSubButton>
                                    {/* Tricks */}
                                    {isSubcatExpanded && (
                                      <SidebarMenuSub>
                                        {/* Add "All Tricks" link if there are more than 3 tricks */}
                                        {!subcat.tricksLoading &&
                                          (subcat.tricks?.length ?? 0) > 3 && (
                                            <SidebarMenuSubItem>
                                              <SidebarMenuSubButton
                                                asChild
                                                onClick={() => {
                                                  if (onItemClick)
                                                    onItemClick();
                                                }}
                                              >
                                                <Link
                                                  href={`/${category.slug}/${subcat.slug}`}
                                                  className="text-xs py-1 block font-medium text-primary hover:underline"
                                                >
                                                  All Tricks
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          )}

                                        {subcat.tricksLoading ? (
                                          <SidebarMenuSubItem>
                                            <div className="flex items-center py-1">
                                              <Loader2 className="h-2 w-2 md:h-3 md:w-3 animate-spin" />
                                              <span className="ml-2 text-xs ">
                                                Loading tricks...
                                              </span>
                                            </div>
                                          </SidebarMenuSubItem>
                                        ) : (subcat.tricks?.length ?? 0) ===
                                          0 ? (
                                          <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                              asChild
                                              onClick={() => {
                                                if (onItemClick) onItemClick();
                                              }}
                                            >
                                              <Link
                                                href={
                                                  user
                                                    ? `/${category.slug}/${subcat.slug}/new`
                                                    : "/login"
                                                }
                                                className="text-xs py-1 block hover:underline truncate"
                                                title={"Add Trick"}
                                              >
                                                Add First Trick
                                              </Link>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        ) : (
                                          (subcat.tricks ?? []).map((trick) => (
                                            <SidebarMenuSubItem
                                              key={trick.slug}
                                            >
                                              <SidebarMenuSubButton
                                                asChild
                                                onClick={() => {
                                                  if (onItemClick)
                                                    onItemClick();
                                                }}
                                              >
                                                <Link
                                                  href={`/${category.slug}/${subcat.slug}/${trick.slug}`}
                                                  className="text-xs py-1 block hover:underline truncate"
                                                  title={trick.name}
                                                >
                                                  {trick.name}
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))
                                        )}
                                      </SidebarMenuSub>
                                    )}
                                  </SidebarMenuSubItem>
                                );
                              })
                            )}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  })
                )}

                {/* Mobile-only user nav or login/join buttons after categories */}
                <div className="block sm:hidden">
                  <div className="my-4 border-t border-border" />
                  {user ? (
                    // User navigation for logged-in users
                    <>
                      <SidebarMenuItem>
                        <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.user_metadata?.avatar_url}
                              alt="Avatar"
                            />
                            <AvatarFallback>
                              {user.user_metadata?.first_name?.[0]?.toUpperCase() ||
                                user.email?.[0]?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            {/* <p className="text-sm font-medium leading-none truncate">
                              {user.user_metadata?.first_name}{" "}
                              {user.user_metadata?.last_name}
                            </p> */}
                            <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </SidebarMenuItem>
                      {/* <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            if (onItemClick) onItemClick();
                          }}
                        >
                          <Link
                            href="/profile"
                            className="w-full text-sm py-2 block hover:bg-accent hover:text-accent-foreground rounded"
                          >
                            Profile
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem> */}
                      {/* <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            if (onItemClick) onItemClick();
                          }}
                        >
                          <Link
                            href="/dashboard"
                            className="w-full text-sm py-2 block hover:bg-accent hover:text-accent-foreground rounded"
                          >
                            Dashboard
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem> */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={handleSignOut}
                          className="w-full text-sm py-2 block hover:bg-accent hover:text-accent-foreground rounded text-left"
                        >
                          Sign out
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  ) : (
                    // Login buttons for non-authenticated users
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            if (onItemClick) onItemClick();
                          }}
                        >
                          <Link
                            href="/login"
                            className="w-full text-sm py-2 block flex items-center justify-center border border-border rounded mb-2"
                          >
                            <span className="mr-2">Sign In</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            if (onItemClick) onItemClick();
                          }}
                        >
                          <Link
                            href="/login"
                            className="w-full text-sm py-2 block flex items-center justify-center bg-primary text-primary-foreground rounded"
                          >
                            <span className="mr-2">Join Now</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </>
  );
}
