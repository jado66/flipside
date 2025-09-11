"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  hubs: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
}

interface ScheduleCardProps {
  schedule: Schedule;
  showUser?: boolean;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function ScheduleCard({
  schedule,
  showUser = false,
  onDelete,
  canDelete = false,
}: ScheduleCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {schedule.day_of_week}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime(schedule.start_time)} -{" "}
                {formatTime(schedule.end_time)}
              </span>
            </div>
          </div>
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(schedule.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{schedule.hubs.name}</p>
            <p className="text-sm text-muted-foreground">
              {schedule.hubs.city}, {schedule.hubs.state}
            </p>
          </div>
        </div>

        {showUser && schedule.users && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {schedule.users.first_name} {schedule.users.last_name}
            </span>
          </div>
        )}

        {schedule.notes && (
          <p className="text-sm text-muted-foreground">{schedule.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
