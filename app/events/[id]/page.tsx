"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, DollarSign, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Event {
  id: string
  title: string
  description: string | null
  event_type: string
  start_time: string
  end_time: string
  max_participants: number | null
  current_participants: number
  price: number
  skill_level: string | null
  sports: string[]
  hubs: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip_code: string
  }
  users: {
    first_name: string
    last_name: string
  }
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadEvent()
      loadUser()
    }
  }, [params.id])

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user && params.id) {
      const { data } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", params.id)
        .eq("user_id", user.id)
        .single()
      setIsRegistered(!!data)
    }
  }

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          hubs!inner(id, name, address, city, state, zip_code),
          users!events_organizer_id_fkey(first_name, last_name)
        `,
        )
        .eq("id", params.id)
        .eq("is_active", true)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error("Error loading event:", error)
      router.push("/events")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setJoining(true)
    setError(null)

    try {
      const { error } = await supabase.from("event_participants").insert([
        {
          event_id: params.id,
          user_id: user.id,
        },
      ])

      if (error) throw error

      // Update current participants count
      await supabase.rpc("increment_event_participants", { event_id: params.id })

      setIsRegistered(true)
      loadEvent() // Reload to get updated participant count
    } catch (error: any) {
      setError(error.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!event) {
    return <div className="container mx-auto px-4 py-8">Event not found</div>
  }

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const spotsLeft = event.max_participants ? event.max_participants - event.current_participants : null
  const isFull = spotsLeft === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={event.event_type === "class" ? "default" : "secondary"}>
                {event.event_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              {event.skill_level && (
                <Badge variant="outline">
                  {event.skill_level.charAt(0).toUpperCase() + event.skill_level.slice(1)}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-balance mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {event.sports.map((sport) => (
                <Badge key={sport} className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </Badge>
              ))}
            </div>

            {event.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>
                  {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Link href={`/hubs/${event.hubs.id}`} className="font-medium hover:text-orange-600">
                    {event.hubs.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {event.hubs.address}, {event.hubs.city}, {event.hubs.state} {event.hubs.zip_code}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>
                  {event.current_participants} participant{event.current_participants !== 1 ? "s" : ""}
                  {event.max_participants && ` (${spotsLeft} spots left)`}
                </span>
              </div>
              {event.price > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>${event.price}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>
                  Organized by {event.users.first_name} {event.users.last_name}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Join Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isRegistered ? (
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 mb-4">Registered</Badge>
                  <p className="text-sm text-muted-foreground">You're registered for this event!</p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinEvent}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={joining || isFull}
                >
                  {joining
                    ? "Joining..."
                    : isFull
                      ? "Event Full"
                      : event.price > 0
                        ? `Join - $${event.price}`
                        : "Join Event"}
                </Button>
              )}

              {event.price > 0 && !isRegistered && (
                <p className="text-xs text-muted-foreground text-center">
                  Payment will be processed at the event location
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
