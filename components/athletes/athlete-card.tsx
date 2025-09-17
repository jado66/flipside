import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Athlete } from "@/types/athlete";

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "professional":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "elite":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Link href={`/athletes/${athlete.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
          {athlete.profile_image_url ? (
            <Image
              src={athlete.profile_image_url || "/placeholder.svg"}
              alt={athlete.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {athlete.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={getSkillLevelColor(athlete.skill_level)}>
              {athlete.skill_level}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-balance group-hover:text-primary transition-colors">
                {athlete.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {athlete.sport}
              </p>
            </div>

            {athlete.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {athlete.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {athlete.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{athlete.country}</span>
                </div>
              )}

              {athlete.years_experience && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{athlete.years_experience} years</span>
                </div>
              )}

              {athlete.signature_tricks &&
                athlete.signature_tricks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>
                      {athlete.signature_tricks.length} signature tricks
                    </span>
                  </div>
                )}
            </div>

            {athlete.sponsors && athlete.sponsors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {athlete.sponsors.slice(0, 3).map((sponsor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sponsor}
                  </Badge>
                ))}
                {athlete.sponsors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{athlete.sponsors.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
