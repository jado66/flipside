import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContributingSection from "@/components/contributing-section";
import { CommunityStats } from "@/components/community-stats";
import {
  Plus,
  Edit3,
  Users,
  BookOpen,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-muted/20 py-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            Join the Community
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Help Build the World&apos;s Best
            <br />
            <span className="text-primary">Trick Database</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Trickipedia thrives because of passionate contributors like you.
            Whether you&apos;re adding new tricks, improving existing content,
            or helping moderate the community, every contribution matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link href="#browse-categories">
                <Search className="w-5 h-5 mr-2" />
                Browse Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <CommunityStats />

      {/* Ways to Contribute */}
      <section id="browse-categories" className="py-20 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start by Browsing Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Before adding a new trick, check if it already exists in our
              database. If you find it, help improve it! If it doesn&apos;t
              exist, then it&apos;s time to add it as a new entry.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
            <Link
              href="/parkour"
              className="group p-4 bg-card-foreground/80 text-background hover:bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="text-lg font-semibold group-hover:text-primary transition-colors">
                  Parkour
                </div>
                <div className="text-xs group-hover:text-primary mt-1 transition-colors">
                  View Tricks
                </div>
              </div>
            </Link>

            <Link
              href="/tricking"
              className="group p-4 bg-card-foreground/80 text-background hover:bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="text-lg font-semibold group-hover:text-primary transition-colors">
                  Tricking
                </div>
                <div className="text-xs group-hover:text-primary mt-1 transition-colors">
                  View Tricks
                </div>
              </div>
            </Link>

            <Link
              href="/trampoline"
              className="group p-4 bg-card-foreground/80 text-background hover:bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="text-lg font-semibold group-hover:text-primary transition-colors">
                  Trampoline
                </div>
                <div className="text-xs group-hover:text-primary mt-1 transition-colors">
                  View Tricks
                </div>
              </div>
            </Link>

            <Link
              href="/trampwall"
              className="group p-4 bg-card-foreground/80 text-background hover:bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="text-lg font-semibold group-hover:text-primary transition-colors">
                  Trampwall
                </div>
                <div className="text-xs group-hover:text-primary mt-1 transition-colors">
                  View Tricks
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Can&apos;t find the trick you&apos;re looking for? Then it&apos;s
              time to add it! You can click{" "}
              <strong>&quot;Add New Trick&quot;</strong> inside the trick
              category.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ways to Contribute
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose how you want to help grow the Trickipedia community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add New Tricks */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Add New Tricks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  After browsing our categories and confirming a trick
                  doesn&apos;t exist, add it to help expand our database.
                  Include descriptions, difficulty levels, and step-by-step
                  guides.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Check categories first
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Easy-to-use form interface
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Add videos and images
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Existing */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">
                  Improve Existing Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Help make existing tricks better by adding missing
                  information, correcting errors, or enhancing descriptions and
                  guides.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Fix typos and errors
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Add missing media
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Enhance descriptions
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Moderation */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Become a Moderator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Take on advanced responsibilities like organizing content,
                  adding new categories, and helping guide the community.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Advanced editing privileges
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Help organize categories
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Guide new contributors
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled
                >
                  Contact @jdparkour on Instagram
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contributing Guidelines */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contributing Guidelines</h2>
            <p className="text-xl text-muted-foreground">
              Follow these simple guidelines to ensure quality contributions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  <CardTitle>Quality Standards</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    Provide clear, accurate descriptions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Use proper spelling and grammar</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    Include relevant media when possible
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Set appropriate difficulty levels</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <CardTitle>Content Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Focus on action sports tricks only</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Avoid duplicate entries</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Include safety considerations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">Respect intellectual property</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <ContributingSection />

      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Mark?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of action sports enthusiasts who are building the
            world&apos;s most comprehensive trick database. Your expertise and
            passion can help others learn and progress in their favorite sports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link href="#browse-categories">
                <Search className="w-5 h-5 mr-2" />
                Start by Browsing
              </Link>
            </Button>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto bg-transparent"
              >
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
