"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Clock } from "lucide-react";
import { TrickImage } from "@/components/trick-image";
import { Trick } from "@/types/trick";

interface TrickCardProps {
  trick: Trick;
  categorySlug: string;
  subcategorySlug: string;
  difficultyLabels: Record<number, string>;
  difficultyColors: Record<number, string>;
}

export function TrickCard({
  trick,
  categorySlug,
  subcategorySlug,
  difficultyLabels,
  difficultyColors,
}: TrickCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link href={`/${categorySlug}/${subcategorySlug}/${trick.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden pt-0">
        <div className="aspect-video relative overflow-hidden">
          <TrickImage
            trick={trick}
            alt={trick.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {trick.subcategory?.master_category.name}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            {trick.difficulty_level && (
              <div
                className={`w-6 h-6 ${
                  difficultyColors[
                    trick.difficulty_level as keyof typeof difficultyColors
                  ]
                } rounded-full flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {trick.difficulty_level}
                </span>
              </div>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {trick.subcategory?.name}
            </Badge>
            {trick.difficulty_level && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  difficultyColors[
                    trick.difficulty_level as keyof typeof difficultyColors
                  ]
                } text-white border-0`}
              >
                {
                  difficultyLabels[
                    trick.difficulty_level as keyof typeof difficultyLabels
                  ]
                }
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{trick.name}</CardTitle>
          <CardDescription className="text-sm text-pretty line-clamp-2">
            {trick.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{trick.view_count.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(trick.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
