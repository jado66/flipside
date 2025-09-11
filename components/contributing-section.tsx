import { Instagram, User } from "lucide-react";

export default function ContributingSection() {
  return (
    <section className="w-full flex flex-col items-center py-16 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Join the Movement
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trickipedia is powered by its passionate community of action sports
            enthusiasts like you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Regular Contributors Card */}
          <div className="flex flex-col bg-card rounded-2xl shadow-xl p-8 border border-border/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <User />
              </div>
              <h3 className="text-2xl font-bold">Contributors</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Anyone with an account can add and edit tricks, helping to grow
              and improve Trickipedia for everyone. Your knowledge and
              experience help build the world&apos;s most comprehensive trick
              database.
            </p>
            <div className="flex-grow" />

            <div className="flex items-center text-sm text-primary font-medium">
              <span>Start contributing today</span>
            </div>
          </div>

          {/* Moderators Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-primary/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Moderators</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Moderators have advanced privileges, including the ability to add
              new categories and help organize content. To become a moderator,
              you must reach out to <b>@jdparkour</b> on Instagram to have
              moderator permissions granted. Help shape the future of
              Trickipedia and guide our growing community.
            </p>
            <div className="flex items-center text-sm text-primary font-medium">
              <span>Apply for moderation</span>
            </div>
          </div>
        </div>

        <div className="text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If you&apos;re passionate about action sports and want to help shape
            the future of Trickipedia, reach out to <b>@jdparkour</b> on
            Instagram to become a moderator and join our core team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center bg-card rounded-full px-6 py-3 shadow-md border border-border/50">
              <Instagram className="w-5 h-5 text-pink-500 mr-3" />
              <span className="font-semibold">@jdparkour</span>
            </div>
            <span className="text-muted-foreground">on Instagram</span>
          </div>
          <p className="text-sm text-muted-foreground mt-6 font-medium">
            Every contribution makes a difference. Join us and help build the
            world&apos;s best trick database!
          </p>
        </div>
      </div>
    </section>
  );
}
