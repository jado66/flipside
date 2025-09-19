"use client";

import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { iconMap } from "./icon-map";
import { TrickipediaLogo } from "../trickipedia-logo";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { useNavigation } from "@/contexts/navigation-provider";
import { cn } from "@/lib/utils";

export function MasterSideNav({
  onItemClick,
}: { onItemClick?: () => void } = {}) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Use the navigation context
  const {
    categories,
    isLoading,
    error,
    loadSubcategories,
    loadTricks,
    expandedItems,
    setExpandedItems,
  } = useNavigation();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    if (onItemClick) onItemClick();
  };

  // Only allow one master category open at a time
  const toggleExpanded = async (
    id: string,
    isMasterCategory = false,
    categorySlug?: string,
    subcategorySlug?: string
  ) => {
    if (isMasterCategory && categorySlug) {
      // If already open, close it; else, open only this one
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
          return newSet;
        } else {
          // Load subcategories when expanding a category
          loadSubcategories(categorySlug);
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
          // Load tricks when expanding a subcategory
          if (categorySlug && subcategorySlug) {
            loadTricks(categorySlug, subcategorySlug);
          }
        }
        return newSet;
      });
    }
  };

  const CloseSideBarLink = ({ children, href, className }) => {
    return (
      <Link
        href={href}
        className={`w-full text-lg py-0 block flex items-center justify-center border border-border rounded mb-2 ${className}`}
        onClick={onItemClick}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop spacer for topbar, only visible on desktop */}
      <div className="h-16 hidden sm:block" />

      {/* Mobile logo */}
      <div className="block sm:hidden flex">
        <TrickipediaLogo />
      </div>

      <div className="w-full flex flex-col min-h-0 flex-1">
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Mobile-only links above categories */}

                {/* Categories */}
                <Link href="/sports-and-disciplines" className="w-full block">
                  <SidebarHeader className="text-2xl ">
                    Sports &amp; Disciplines
                  </SidebarHeader>
                </Link>
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
                            toggleExpanded(category.slug, true, category.slug);
                          }}
                          className={cn(
                            "text-xl md:text-base group",
                            "hover:text-muted"
                          )}
                        >
                          <div className="flex items-center gap-2 cursor-pointer">
                            <Icon
                              className={cn(
                                "h-4 w-4 md:h-5 md:w-5",
                                "hover:text-muted"
                              )}
                            />
                            <span className="truncate">{category.name}</span>
                            {category.status === "in_progress" && (
                              <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                BETA
                              </span>
                            )}
                            {isCategoryExpanded ? (
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 md:h-4 md:w-4 ml-1",
                                  "hover:text-muted"
                                )}
                              />
                            ) : (
                              <ChevronRight
                                className={cn(
                                  "h-3 w-3 md:h-4 md:w-4 ml-1",
                                  "hover:text-muted"
                                )}
                              />
                            )}
                          </div>
                        </SidebarMenuButton>
                        {/* Subcategories */}
                        {isCategoryExpanded && (
                          <SidebarMenuSub>
                            {/* Add "All Categories" link if there are more than 3 subcategories */}

                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                onClick={() => {
                                  if (onItemClick) onItemClick();
                                }}
                                className="text-md md:text-sm hover:text-muted"
                              >
                                <Link
                                  href={`/${category.slug}`}
                                  className=" py-1 block font-medium text-primary "
                                >
                                  All Tricks
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>

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
                                        toggleExpanded(
                                          subcatKey,
                                          false,
                                          category.slug,
                                          subcat.slug
                                        );
                                      }}
                                      isActive={isSubcatExpanded}
                                      className={cn(
                                        "text-md md:text-xs hover:text-muted ",
                                        isSubcatExpanded && "!text-muted"
                                      )}
                                    >
                                      <div className="flex items-center gap-2 cursor-pointer py-1">
                                        <span className="truncate">
                                          {subcat.name}
                                        </span>
                                        {isSubcatExpanded ? (
                                          <ChevronDown
                                            className={cn(
                                              "h-2 w-2 md:h-3 md:w-3 ml-1 flex-shrink-0",
                                              "hover:text-muted",
                                              isSubcatExpanded && "!text-muted"
                                            )}
                                          />
                                        ) : (
                                          <ChevronRight
                                            className={cn(
                                              "h-2 w-2 md:h-3 md:w-3 ml-1 flex-shrink-0",
                                              "hover:text-muted",
                                              isSubcatExpanded && "!text-muted"
                                            )}
                                          />
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
                                                className="text-md md:text-xs hover:text-muted"
                                              >
                                                <Link
                                                  href={`/${category.slug}/${subcat.slug}`}
                                                  className="py-1 block font-medium text-primary"
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
                                              className="text-md md:text-xs hover:text-muted"
                                            >
                                              <Link
                                                href={
                                                  user
                                                    ? `/${category.slug}/${subcat.slug}/new`
                                                    : "/login"
                                                }
                                                className=" py-1 block truncate"
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
                                                className="text-md md:text-xs hover:text-muted"
                                              >
                                                <Link
                                                  href={`/${category.slug}/${subcat.slug}/${trick.slug}`}
                                                  className="py-1 block truncate"
                                                  title={trick.name}
                                                >
                                                  {trick.name}
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))
                                        )}

                                        {(subcat.tricks?.length ?? 0) > 0 && (
                                          <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                              asChild
                                              onClick={() => {
                                                if (onItemClick) onItemClick();
                                              }}
                                              className="text-md md:text-xs hover:text-muted"
                                            >
                                              <Link
                                                href={`/${category.slug}/${subcat.slug}/new`}
                                                className=" py-1 block truncate"
                                                title={"Add Trick"}
                                              >
                                                Add Trick
                                              </Link>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        )}
                                      </SidebarMenuSub>
                                    )}
                                  </SidebarMenuSubItem>
                                );
                              })
                            )}
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                onClick={() => {
                                  if (onItemClick) onItemClick();
                                }}
                                className="text-md md:text-sm hover:text-muted"
                              >
                                <Link
                                  href={`/${category.slug}/skill-tree`}
                                  className=" py-1 block font-medium text-primary capitalize"
                                >
                                  View Skill Tree
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  })
                )}

                {/* Mobile-only user nav or login/join buttons after categories */}
                <div className="block sm:hidden">
                  <div className="my-4 border-t border-border" />
                  <CloseSideBarLink href="/about" className="w-full block">
                    <SidebarHeader className="text-md ">About</SidebarHeader>
                  </CloseSideBarLink>
                  <CloseSideBarLink href="/contribute" className="w-full block">
                    <SidebarHeader className="text-md ">
                      Help Contribute
                    </SidebarHeader>
                  </CloseSideBarLink>
                  <CloseSideBarLink href="/faqs" className="w-full block">
                    <SidebarHeader className="text-md ">FAQs</SidebarHeader>
                  </CloseSideBarLink>

                  <div className="my-4 border-t border-border" />
                  {user ? (
                    // User navigation for logged-in users
                    <>
                      <SidebarMenuItem>
                        {/* <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.user_metadata?.avatar_url}
                              alt="Avatar"
                            />
                            <AvatarFallback>
                              {user.user_metadata?.first_name?.[0]?.toUpperCase() ||
                                user.email?.[0]?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar> */}

                        {/* <p className="text-xs leading-none text-muted-foreground truncate"> */}
                        <CloseSideBarLink
                          href={`/profile`}
                          className=" block truncate"
                        >
                          <SidebarHeader>{user.email}</SidebarHeader>
                        </CloseSideBarLink>

                        {/* </p> */}
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={handleSignOut}
                          className="w-full text-lg py-6 block flex items-center justify-center border border-border rounded mb-2"
                        >
                          Sign out
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  ) : (
                    // Login buttons for non-authenticated users
                    <>
                      <CloseSideBarLink
                        href={`/login`}
                        className=" block truncate"
                      >
                        <SidebarHeader>Sign In</SidebarHeader>
                      </CloseSideBarLink>

                      <CloseSideBarLink
                        href={`/login`}
                        className=" block truncate bg-primary text-primary-foreground"
                      >
                        <SidebarHeader>Join Now</SidebarHeader>
                      </CloseSideBarLink>
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
