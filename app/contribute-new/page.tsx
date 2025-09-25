import {
  User,
  Trophy,
  Star,
  Shield,
  Crown,
  Zap,
  Users,
  Edit,
  Plus,
  UserCheck,
} from "lucide-react";

// XP Level System Configuration
const XP_LEVELS = [
  {
    level: 1,
    name: "Newcomer",
    minXP: 0,
    maxXP: 99,
    icon: User,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    rewards: ["Basic contributor access", "Can add and edit tricks"],
  },
  {
    level: 2,
    name: "Contributor",
    minXP: 100,
    maxXP: 499,
    icon: Edit,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    rewards: ["Profile badge", "Priority support", "Early feature access"],
  },
  {
    level: 3,
    name: "Moderator",
    minXP: 500,
    maxXP: 1499,
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    rewards: [
      "Moderator privileges",
      "Add new categories",
      "Content management",
    ],
  },
  {
    level: 4,
    name: "Expert",
    minXP: 1500,
    maxXP: 2999,
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    rewards: ["Expert badge", "Featured content", "Community recognition"],
  },
  {
    level: 5,
    name: "Legend",
    minXP: 3000,
    maxXP: Number.POSITIVE_INFINITY,
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    rewards: [
      "Legend status",
      "Hall of Fame eligibility",
      "Platform influence",
    ],
  },
];

const XP_ACTIONS = [
  {
    action: "Add a new trick",
    xp: "50-100 XP",
    icon: Plus,
    description: "Create comprehensive trick guides",
  },
  {
    action: "Edit existing tricks",
    xp: "5-50 XP",
    icon: Edit,
    description: "Based on the scope of changes made",
  },
  {
    action: "Successful referral",
    xp: "200 XP",
    icon: UserCheck,
    description: "Most valuable - invite active users",
  },
  {
    action: "Community engagement",
    xp: "10-25 XP",
    icon: Users,
    description: "Help others, answer questions",
  },
];

export default function ContributingSection() {
  return (
    <section className="w-full flex flex-col items-center py-16 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Level Up Your Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn XP through contributions and unlock rewards as you progress
            through 5 exciting levels.
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            How to Earn XP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {XP_ACTIONS.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{item.xp}</div>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">{item.action}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12">
            Level Progression
          </h3>
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 rounded-full"></div>

            {XP_LEVELS.map((level, index) => {
              const IconComponent = level.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={level.level}
                  className="relative flex items-center mb-0 last:mb-0"
                >
                  {/* Timeline node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className={`w-16 h-16 bg-white border-4 border-background rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className={`w-8 h-8 ${level.color}`} />
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    className={`w-full flex ${
                      isEven ? "justify-start pr-1/2" : "justify-end pl-1/2"
                    }`}
                  >
                    <div
                      className={`w-full max-w-sm ${isEven ? "mr-8" : "ml-8"}`}
                    >
                      <div
                        className={`bg-card rounded-2xl p-6 border ${level.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 relative`}
                      >
                        <div className="text-center mb-4">
                          <h4 className="text-2xl font-bold">{level.name}</h4>
                          <div className="text-sm text-muted-foreground mb-2">
                            Level {level.level}
                          </div>
                          <div className={`text-lg font-bold ${level.color}`}>
                            {level.maxXP === Number.POSITIVE_INFINITY
                              ? `${level.minXP}+ XP`
                              : `${level.minXP}-${level.maxXP} XP`}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                            Rewards
                          </h5>
                          {level.rewards.map((reward, rewardIndex) => (
                            <div
                              key={rewardIndex}
                              className="flex items-center text-sm"
                            >
                              <div
                                className={`w-2 h-2 ${level.color.replace(
                                  "text-",
                                  "bg-"
                                )} rounded-full mr-3 flex-shrink-0`}
                              ></div>
                              <span>{reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-primary mr-3" />
            <h3 className="text-2xl font-bold">Ready to Start Earning XP?</h3>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every contribution counts! Start with small edits, add new tricks,
            and invite friends to begin your journey to Legend status.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border/50">
              <Plus className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">Add Content</div>
              <div className="text-sm text-muted-foreground">
                Create new tricks and guides
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/50">
              <Edit className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">Improve Existing</div>
              <div className="text-sm text-muted-foreground">
                Edit and enhance content
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/50">
              <UserCheck className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">Invite Friends</div>
              <div className="text-sm text-muted-foreground">
                Earn the most XP through referrals
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-medium">
            <Trophy className="w-4 h-4 inline mr-1" />
            Reach Level 3 to unlock moderator privileges and help shape
            Trickipedia&apos;s future!
          </p>
        </div>
      </div>
    </section>
  );
}
