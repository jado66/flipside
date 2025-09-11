import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  current_participants: number;
  price: number;
  skill_level: string | null;
  sports: string[];
  hubs: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const spotsLeft = event.max_participants
    ? event.max_participants - event.current_participants
    : null;

  return (
    <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg text-balance">{event.title}</CardTitle>
          <Badge
            variant={event.event_type === "class" ? "default" : "secondary"}
            className="text-xs"
          >
            {event.event_type.replace("_", " ")}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4" />
          {event.hubs.name} • {event.hubs.city}, {event.hubs.state}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(startDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {event.sports.slice(0, 2).map((sport) => (
            <Badge key={sport} variant="outline" className="text-xs">
              {sport}
            </Badge>
          ))}
          {event.sports.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{event.sports.length - 2} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {event.price > 0 && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>${event.price}</span>
              </div>
            )}
            {event.skill_level && (
              <Badge variant="secondary" className="text-xs">
                {event.skill_level}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              {event.current_participants}
              {event.max_participants && `/${event.max_participants}`}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Details
            </Button>
          </Link>
          <Button
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            disabled={spotsLeft === 0}
          >
            {spotsLeft === 0 ? "Full" : "Join Event"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
