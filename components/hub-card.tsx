import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Globe, Users } from "lucide-react";
import Link from "next/link";
// Removed next/image usage

interface Hub {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website_url: string | null;
  images: string[];
  sports: string[];
  amenities: string[];
}

interface HubCardProps {
  hub: Hub;
}

export function HubCard({ hub }: HubCardProps) {
  // Use hub.images[0] if available, fallback to hub.image_url, then placeholder
  const imageSrc =
    (Array.isArray(hub.images) && hub.images[0]) ||
    "/placeholder.svg?height=200&width=400&query=action sports gym";
  return (
    <Link href={`/hubs/${hub.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={imageSrc}
            alt={hub.name}
            className="object-cover w-full h-full absolute inset-0"
            style={{ objectFit: "cover" }}
          />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-balance">{hub.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            {hub.city}, {hub.state}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {hub.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {hub.sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="secondary" className="text-xs">
                {sport}
              </Badge>
            ))}
            {hub.sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hub.sports.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {hub.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="sr-only">Phone available</span>
                </div>
              )}
              {hub.website_url && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span className="sr-only">Website available</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="text-xs">View Details</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
