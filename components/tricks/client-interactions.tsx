"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Heart, Share2, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { PermissionGate } from "@/components/permission-gate";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/supabase-client";
import {
  incrementTrickViews,
  toggleTrickLike,
} from "@/lib/client/tricks-data-client";
import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface ClientInteractionsProps {
  trick: TrickWithLinkedPrerequisites;
}

export function ClientInteractions({ trick }: ClientInteractionsProps) {
  const router = useRouter();
  const { user, hasModeratorAccess } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(trick.like_count);

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  useEffect(() => {
    const initializeInteractions = async () => {
      // Increment view count
      await incrementTrickViews(trick.id);

      // Check if user has liked this trick
      if (user) {
        const { data: likeData } = await supabase
          .from("trick_likes")
          .select("id")
          .eq("trick_id", trick.id)
          .eq("user_id", user.id)
          .single();

        setLiked(!!likeData);
      }
    };

    initializeInteractions();
  }, [trick.id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like tricks");
      return;
    }

    try {
      const result = await toggleTrickLike(trick.id, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("tricks")
        .delete()
        .eq("id", trick.id);

      if (error) throw error;

      toast.success("Trick deleted successfully");
      router.push(
        `/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`
      );
    } catch (error) {
      console.error("Failed to delete trick:", error);
      toast.error("Failed to delete trick");
    }
  };

  const canEdit = user;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="font-medium">
            {trick.view_count.toLocaleString()}
          </span>
          <span>views</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="font-medium">{likeCount}</span>
          <span>likes</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          className={liked ? "bg-red-500 hover:bg-red-600 border-red-500" : ""}
        >
          <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
          {liked ? "Liked" : "Like"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {canEdit && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}/${trick.slug}/edit`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            <PermissionGate requireModerator>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Trick</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;
                      {trick.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PermissionGate>
          </>
        )}
      </div>
    </div>
  );
}
