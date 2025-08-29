import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, RotateCcw, Activity, Bone as Bounce } from "lucide-react";

const categories = [
  {
    id: "parkour",
    name: "Parkour",
    description:
      "Movement discipline focused on efficient navigation through environments",
    icon: Zap,
    color: "bg-primary",
    trickCount: 156,
    slug: "parkour",
  },
  {
    id: "tricking",
    name: "Tricking",
    description: "Martial arts and gymnastics-inspired acrobatic movements",
    icon: RotateCcw,
    color: "bg-secondary",
    trickCount: 203,
    slug: "tricking",
  },
  {
    id: "gymnastics",
    name: "Gymnastics",
    description: "Traditional gymnastics movements and skills",
    icon: Activity,
    color: "bg-chart-2",
    trickCount: 89,
    slug: "gymnastics",
  },
  {
    id: "trampwall",
    name: "Trampwall",
    description: "Acrobatic movements performed on trampolines and walls",
    icon: Bounce,
    color: "bg-chart-4",
    trickCount: 67,
    slug: "trampwall",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance mb-4">
            Explore by Discipline
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Dive deep into your favorite movement discipline and discover new
            techniques to master.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} href={`/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-pretty">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Badge variant="secondary" className="text-xs">
                      {category.trickCount} tricks
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
