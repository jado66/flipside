import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Active Members",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "Growing community of athletes",
  },
  {
    title: "Total Tricks",
    value: "515",
    change: "+8%",
    changeType: "positive" as const,
    icon: BookOpen,
    description: "Comprehensive trick database",
  },
  {
    title: "Comments",
    value: "3,892",
    change: "+23%",
    changeType: "positive" as const,
    icon: MessageSquare,
    description: "Community discussions",
  },
  {
    title: "Monthly Views",
    value: "28.5k",
    change: "+15%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Learning sessions this month",
  },
]

export function CommunityStats() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance mb-4">Growing Community</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Join thousands of athletes sharing knowledge and pushing the boundaries of movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary mb-1">{stat.value}</CardTitle>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium">{stat.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === "positive"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
