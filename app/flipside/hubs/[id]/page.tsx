import { notFound, redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Phone, Globe, Mail, Heart, Calendar } from "lucide-react";
// Removed next/image usage
import Link from "next/link";
import { HubScheduleView } from "@/components/hub-schedule-view";
import { supabase } from "@/lib/supbase";

interface HubPageProps {
  params: Promise<{ id: string }>;
}

export default async function HubPage({ params }: HubPageProps) {
  const { id } = await params;

  // Fetch hub data - fetch both images array and legacy image_url for backwards compatibility
  const { data: hub, error } = await supabase
    .from("hubs")
    .select(`*, users!hubs_owner_id_fkey(first_name, last_name)`)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !hub) {
    notFound();
  }

  // Handle images - use new images array if available, fallback to legacy image_url
  const hubImages =
    hub.images && hub.images.length > 0
      ? hub.images.filter((url: string) => url && url.trim() !== "")
      : hub.image_url
      ? [hub.image_url]
      : [];

  // Fallback placeholder if no images
  const displayImages =
    hubImages.length > 0
      ? hubImages
      : [
          "/placeholder.svg?height=400&width=800&query=action sports gym interior",
        ];

  // Fetch current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user && user.id === hub.owner_id;

  async function handleDelete() {
    "use server";

    await supabase.from("hubs").delete().eq("id", id);
    redirect("/hubs");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          <div className="relative">
            {displayImages.length === 1 ? (
              // Single image display
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={displayImages[0]}
                  alt={hub.name}
                  className="object-cover w-full h-full absolute inset-0"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              // Multiple images carousel
              <Carousel className="w-full">
                <CarouselContent>
                  {displayImages.map((imageUrl: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img
                          src={imageUrl}
                          alt={`${hub.name} - Image ${index + 1}`}
                          className="object-cover w-full h-full absolute inset-0"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {displayImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
              </Carousel>
            )}

            {/* Image counter for multiple images */}
            {displayImages.length > 1 && hubImages.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {displayImages.length}{" "}
                {displayImages.length === 1 ? "photo" : "photos"}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">{hub.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span>
                {hub.address ? `${hub.address}, ` : ""} {hub.city}, {hub.state}{" "}
                {hub.zip_code}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {hub.sports.map((sport: string) => (
                <Badge
                  key={sport}
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </Badge>
              ))}
            </div>

            {hub.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {hub.description}
                </p>
              </div>
            )}
          </div>

          {hub.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hub.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full" />
                      <span className="text-sm">
                        {amenity
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <HubScheduleView hubId={hub.id} />

          {isOwner && (
            <div className="flex gap-3 mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Hub
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your hub and all related data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={handleDelete}>
                      <AlertDialogAction asChild>
                        <Button
                          type="submit"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete
                        </Button>
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Link href={`/hubs/${hub.id}/edit`}>
                <Button variant="outline">Edit Hub</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hub.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${hub.phone}`}
                    className="hover:text-orange-600"
                  >
                    {hub.phone}
                  </a>
                </div>
              )}
              {hub.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${hub.email}`}
                    className="hover:text-orange-600"
                  >
                    {hub.email}
                  </a>
                </div>
              )}
              {hub.website_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={hub.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {hub.users?.first_name} {hub.users?.last_name}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <Heart className="h-4 w-4 mr-2" />
              Follow Hub
            </Button>
            <Link href={`/hubs/${hub.id}/events`} className="block">
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                View Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
