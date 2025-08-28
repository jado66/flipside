import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function TrickipediaHeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Master Every <span className="text-primary">Trick</span> in Your
            Discipline
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            The ultimate collaborative wiki for parkour, tricking, gymnastics,
            and trampwall. Learn, share, and perfect your skills with our
            comprehensive trick database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8">
              Explore Tricks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">
                Documented Tricks
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1.2k</div>
              <div className="text-sm text-muted-foreground">
                Community Members
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Disciplines</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">
                Learning Access
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
