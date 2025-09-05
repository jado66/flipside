import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getTrickBySlugWithLinks,
  type Trick,
} from "@/lib/server/tricks-data-server";
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Edit,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Play,
  ExternalLink,
  Trash2,
  Clock,
  Target,
  Shield,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import { Separator } from "@/components/ui/separator";
import { TrickWithLinkedPrerequisites } from "@/types/trick";
import { PrerequisitesDisplay } from "@/components/prerequisites-display";
import { notFound } from "next/navigation";
import { ClientInteractions } from "@/components/tricks/client-interactions";

const DIFFICULTY_LABELS = {
  1: "Beginner",
  2: "Beginner",
  3: "Beginner",
  4: "Intermediate",
  5: "Intermediate",
  6: "Intermediate",
  7: "Advanced",
  8: "Advanced",
  9: "Expert",
  10: "Expert",
};

const DIFFICULTY_COLORS = {
  1: "bg-emerald-500",
  2: "bg-emerald-500",
  3: "bg-emerald-600",
  4: "bg-amber-500",
  5: "bg-amber-500",
  6: "bg-amber-600",
  7: "bg-orange-500",
  8: "bg-orange-600",
  9: "bg-red-500",
  10: "bg-red-600",
};

interface TrickDetailPageProps {
  params: {
    trick_slug: string;
  };
}

export default async function TrickDetailPage({
  params,
}: TrickDetailPageProps) {
  const resolvedParams = await params;
  const trickslug = resolvedParams.trick_slug;

  let trick: TrickWithLinkedPrerequisites | null = null;

  try {
    trick = await getTrickBySlugWithLinks(trickslug);
  } catch (error) {
    console.error("Failed to load trick:", error);
    notFound();
  }

  if (!trick) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 p-4 bg-muted/30 rounded-lg">
          <Link
            href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`}
            className="hover:text-primary transition-colors font-medium"
          >
            {trick.subcategory?.name}
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">{trick.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-balance mb-4 leading-tight">
                  {trick.name}
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  {trick.description}
                </p>
              </div>

              {trick.image_urls && trick.image_urls.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trick.image_urls.map((url, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-lg border bg-muted"
                      >
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`${trick.name} demonstration ${index + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=256&width=400&query=${encodeURIComponent(
                              `${trick.name} technique demonstration`
                            )}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-sm font-medium">
                            Step {index + 1} - {trick.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client-side interactions component */}
              <ClientInteractions trick={trick} />
            </div>

            {Array.isArray(trick.step_by_step_guide) &&
              trick.step_by_step_guide.length > 0 &&
              trick.step_by_step_guide.some(
                (step) => step.title?.trim() || step.description?.trim()
              ) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Target className="h-6 w-6 text-primary" />
                      Step-by-Step Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {trick.step_by_step_guide.map((step, index) => {
                        const stepNum =
                          typeof step.step === "number" ? step.step : index + 1;
                        const title = step.title || `Step ${stepNum}`;
                        const description = step.description || "";
                        let tips = step.tips;
                        if (!Array.isArray(tips)) {
                          if (typeof tips === "string" && tips.trim()) {
                            tips = [tips];
                          } else {
                            tips = [];
                          }
                        }
                        return (
                          <div key={stepNum} className="relative">
                            {trick.step_by_step_guide &&
                              index < trick.step_by_step_guide.length - 1 && (
                                <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
                              )}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                                {stepNum}
                              </div>
                              <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-semibold leading-tight">
                                  {title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                  {description}
                                </p>
                                {tips.length > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-900">
                                      <Lightbulb className="h-4 w-4" />
                                      Pro Tips
                                    </h4>
                                    <ul className="space-y-1">
                                      {tips.map((tip, tipIndex) => (
                                        <li
                                          key={tipIndex}
                                          className="text-sm text-blue-800 flex items-start gap-2"
                                        >
                                          <span className="text-blue-400 mt-1">
                                            •
                                          </span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

            {trick.tips_and_tricks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-amber-500" />
                    Tips & Tricks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {trick.tips_and_tricks}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {trick.common_mistakes && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-6 w-6" />
                    Common Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-amber-800 leading-relaxed">
                      {trick.common_mistakes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {trick.safety_notes && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 text-red-700">
                    <Shield className="h-6 w-6" />
                    Safety Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-red-800 leading-relaxed">
                      {trick.safety_notes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {trick.prerequisites && trick.prerequisites.length > 0 && (
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="h-6 w-6" />
                    Prerequisites
                  </CardTitle>
                  <CardDescription className="text-emerald-600 dark:text-emerald-400">
                    Master these skills before attempting this trick
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PrerequisitesDisplay
                    prerequisites={trick.prerequisites}
                    prerequisiteTricks={trick.prerequisite_tricks}
                  />
                  {trick.prerequisite_tricks &&
                    trick.prerequisite_tricks.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Click on linked prerequisites to view their details
                      </p>
                    )}
                </CardContent>
              </Card>
            )}

            {trick.video_urls && trick.video_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Play className="h-6 w-6 text-primary" />
                    Video Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {trick.video_urls.map((url, index) => {
                      const getYouTubeVideoId = (url: string) => {
                        const regex =
                          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                        const match = url.match(regex);
                        return match ? match[1] : null;
                      };

                      const youtubeId = getYouTubeVideoId(url);

                      if (youtubeId) {
                        return (
                          <div key={index} className="space-y-3">
                            <h4 className="font-medium text-lg">
                              Video Tutorial {index + 1}
                            </h4>
                            <div
                              className="relative w-full"
                              style={{ paddingBottom: "56.25%" }}
                            >
                              <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={`${trick.name} - Video Tutorial ${
                                  index + 1
                                }`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Play className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium group-hover:text-primary transition-colors">
                                Video Tutorial {index + 1}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Watch this tutorial to learn the technique
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        );
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-sm text-muted-foreground">
              Last edited on{" "}
              {new Date(trick.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Trick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trick.inventor_name && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Invented by {trick.inventor_name}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Difficulty
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 ${
                        DIFFICULTY_COLORS[
                          trick.difficulty_level as keyof typeof DIFFICULTY_COLORS
                        ]
                      } rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">
                        {trick.difficulty_level}
                      </span>
                    </div>
                    <span className="font-medium">
                      {
                        DIFFICULTY_LABELS[
                          trick.difficulty_level as keyof typeof DIFFICULTY_LABELS
                        ]
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestion card - this will need user context from ClientInteractions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-muted-foreground" />
                  Suggest Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Is there anything you would like to change? Is there anything
                  missing?
                </p>
                <Button asChild className="w-full">
                  <Link
                    href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}/${trick.slug}/edit`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit this trick
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="flex flex-row align-center">
                <Link
                  href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/30 rounded-lg hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to {trick.subcategory?.name}</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
