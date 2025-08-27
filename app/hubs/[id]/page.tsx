import { notFound } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe, Mail, Heart, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { HubScheduleView } from "@/components/hub-schedule-view"

interface HubPageProps {
  params: Promise<{ id: string }>
}

export default async function HubPage({ params }: HubPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: hub, error } = await supabase
    .from("hubs")
    .select(`
      *,
      users!hubs_owner_id_fkey(first_name, last_name)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !hub) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <Image
              src={hub.image_url || "/placeholder.svg?height=400&width=800&query=action sports gym interior"}
              alt={hub.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">{hub.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span>
                {hub.address}, {hub.city}, {hub.state} {hub.zip_code}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {hub.sports.map((sport: string) => (
                <Badge key={sport} className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </Badge>
              ))}
            </div>

            {hub.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{hub.description}</p>
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
                        {amenity.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <HubScheduleView hubId={hub.id} />
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
                  <a href={`tel:${hub.phone}`} className="hover:text-orange-600">
                    {hub.phone}
                  </a>
                </div>
              )}
              {hub.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${hub.email}`} className="hover:text-orange-600">
                    {hub.email}
                  </a>
                </div>
              )}
              {hub.website_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={hub.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
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
  )
}
