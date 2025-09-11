"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Settings } from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import type { MasterCategory } from "@/lib/types/database";
import { iconMap } from "@/components/side-nav";

interface CategoriesSearchProps {
  categories: MasterCategory[];
}

export function CategoriesSearch({ categories }: CategoriesSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap.circle;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">
            Movement Disciplines
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            Explore different movement disciplines and discover techniques to
            master your craft.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search disciplines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => {
            const IconComponent = getIconComponent(
              category.icon_name || "circle"
            );
            return (
              <Link key={category.id} href={`/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col">
                  <CardHeader className="text-center pb-4 flex-grow">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: category.color || "" }}
                    >
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-base text-pretty leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center pt-0 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-sm">
                        {category.trick_count} tricks
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      Explore {category.name}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Management Card - Only visible to moderators/admins */}
          <PermissionGate requireModerator>
            <Link href="/admin/manage-sports">
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col">
                <CardHeader className="text-center pb-4 flex-grow">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-blue-500">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    Manage Sports &amp; Disciplines
                  </CardTitle>
                  <CardDescription className="text-base text-pretty leading-relaxed">
                    Add, edit, and organize movement disciplines
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-sm">
                      Admin Tools
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  >
                    Manage Sports &amp; Disciplines
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </PermissionGate>
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No disciplines found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
