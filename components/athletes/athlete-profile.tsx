"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Trophy,
  Users,
  Globe,
  Instagram,
  Youtube,
  ExternalLink,
  Ruler,
  Weight,
  Star,
  Award,
} from "lucide-react";
import Image from "next/image";
// @ts-expect-error TODO
import type { Athlete } from "@/types/athlete";
// import { AthleteInteractions } from "@/components/athlete-interactions";

interface AthleteProfileProps {
  athlete: Athlete;
}

export function AthleteProfile({ athlete }: AthleteProfileProps) {
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Image */}
      {athlete.cover_image_url && (
        <div className="relative h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
          <Image
            src={athlete.cover_image_url || "/placeholder.svg"}
            alt={`${athlete.name} cover`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative">
                  {athlete.profile_image_url ? (
                    <Image
                      src={athlete.profile_image_url || "/placeholder.svg"}
                      alt={athlete.name}
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {athlete.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-balance">
                        {athlete.name}
                      </h1>
                      <Badge
                        className={getSkillLevelColor(athlete.skill_level)}
                      >
                        {athlete.skill_level}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">
                      {athlete.sport}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {athlete.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {athlete.city ? `${athlete.city}, ` : ""}
                          {athlete.country}
                        </span>
                      </div>
                    )}

                    {athlete.date_of_birth && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {calculateAge(athlete.date_of_birth)} years old
                        </span>
                      </div>
                    )}

                    {athlete.years_experience && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{athlete.years_experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* <AthleteInteractions athlete={athlete} /> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {athlete.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {athlete.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Signature Tricks */}
          {athlete.signature_tricks && athlete.signature_tricks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Signature Tricks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {athlete.signature_tricks.map((trick, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {trick}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {athlete.notable_achievements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Notable Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {athlete.notable_achievements}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {athlete.height_cm && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Height</span>
                  </div>
                  <span className="font-medium">{athlete.height_cm} cm</span>
                </div>
              )}

              {athlete.weight_kg && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Weight</span>
                  </div>
                  <span className="font-medium">{athlete.weight_kg} kg</span>
                </div>
              )}

              {athlete.stance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stance</span>
                  <span className="font-medium capitalize">
                    {athlete.stance}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sponsors */}
          {athlete.sponsors && athlete.sponsors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sponsors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {athlete.sponsors.map((sponsor, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="w-full justify-center py-2"
                    >
                      {sponsor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {athlete.instagram_handle && (
                <a
                  href={`https://instagram.com/${athlete.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">@{athlete.instagram_handle}</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              )}

              {athlete.youtube_channel && (
                <a
                  href={`https://youtube.com/@${athlete.youtube_channel}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Youtube className="h-5 w-5 text-red-600" />
                  <span className="text-sm">@{athlete.youtube_channel}</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              )}

              {athlete.website_url && (
                <a
                  href={athlete.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Website</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
