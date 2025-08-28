// Mock data and functions for tricks - replace with real Supabase queries later

export interface Trick {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty_level: number;
  prerequisites: string[];
  step_by_step_guide: {
    step: number;
    title: string;
    description: string;
    tips?: string[];
  }[];
  tips_and_tricks: string;
  common_mistakes: string;
  safety_notes: string;
  video_urls: string[];
  image_urls: string[];
  tags: string[];
  view_count: number;
  like_count: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  subcategory?: {
    name: string;
    slug: string;
    master_category: {
      name: string;
      slug: string;
      color: string;
    };
  };
  author?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Mock tricks data
const mockTricks: Trick[] = [
  {
    id: "1",
    subcategory_id: "1", // Vaults
    name: "Kong Vault",
    slug: "kong-vault",
    description:
      "A fundamental parkour vault where you dive over an obstacle using both hands for support.",
    difficulty_level: 3,
    prerequisites: ["Basic running", "Arm strength"],
    step_by_step_guide: [
      {
        step: 1,
        title: "Approach",
        description:
          "Run towards the obstacle with moderate speed, maintaining good posture.",
        tips: ["Keep your eyes on the obstacle", "Maintain steady breathing"],
      },
      {
        step: 2,
        title: "Takeoff",
        description: "Jump off both feet about 2-3 feet before the obstacle.",
        tips: ["Drive your knees up", "Prepare your arms for contact"],
      },
      {
        step: 3,
        title: "Hand Placement",
        description: "Place both hands on the obstacle, shoulder-width apart.",
        tips: ["Keep arms straight", "Look ahead, not down"],
      },
      {
        step: 4,
        title: "Clear and Land",
        description:
          "Push off with your hands and bring your legs through to clear the obstacle.",
        tips: ["Keep legs together", "Prepare for landing"],
      },
    ],
    tips_and_tricks:
      "Start with lower obstacles and gradually increase height. Practice the motion without an obstacle first.",
    common_mistakes:
      "Placing hands too close together, not committing to the jump, looking down instead of forward.",
    safety_notes:
      "Always check the obstacle is stable. Practice on soft surfaces initially. Ensure adequate clearance.",
    video_urls: ["https://example.com/kong-vault-demo"],
    image_urls: ["/placeholder.svg"],
    tags: ["fundamental", "beginner", "vault", "parkour"],
    view_count: 1247,
    like_count: 89,
    is_published: true,
    created_by: "user-1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    subcategory: {
      name: "Vaults",
      slug: "vaults",
      master_category: {
        name: "Parkour",
        slug: "parkour",
        color: "#164e63",
      },
    },
    author: {
      username: "parkour_pro",
      full_name: "Alex Chen",
      avatar_url: "/placeholder.svg",
    },
  },
  {
    id: "2",
    subcategory_id: "5", // Kicks
    name: "Butterfly Kick",
    slug: "butterfly-kick",
    description:
      "A dynamic kicking technique that combines a jump with a horizontal spinning motion.",
    difficulty_level: 6,
    prerequisites: ["Basic kicks", "Good flexibility", "Core strength"],
    step_by_step_guide: [
      {
        step: 1,
        title: "Setup",
        description:
          "Stand with feet shoulder-width apart, arms at your sides.",
        tips: ["Warm up thoroughly", "Ensure adequate space around you"],
      },
      {
        step: 2,
        title: "Initiate",
        description:
          "Step forward with your non-kicking leg and swing your arms up.",
        tips: ["Generate momentum with your arms", "Keep your core engaged"],
      },
      {
        step: 3,
        title: "Jump and Kick",
        description:
          "Jump off your planted foot while kicking horizontally with the other leg.",
        tips: [
          "Keep the kicking leg straight",
          "Maintain horizontal orientation",
        ],
      },
      {
        step: 4,
        title: "Land",
        description:
          "Land on the foot you kicked with, then bring the other foot down.",
        tips: ["Bend your knees on landing", "Keep your balance"],
      },
    ],
    tips_and_tricks:
      "Practice the motion slowly first. Focus on the horizontal kick rather than height.",
    common_mistakes:
      "Kicking too high instead of horizontal, not generating enough momentum, poor landing technique.",
    safety_notes:
      "Ensure adequate space. Practice on mats initially. Build up flexibility gradually.",
    video_urls: ["https://example.com/butterfly-kick-demo"],
    image_urls: ["/placeholder.svg"],
    tags: ["advanced", "kick", "tricking", "martial-arts"],
    view_count: 892,
    like_count: 156,
    is_published: true,
    created_by: "user-2",
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-10T14:30:00Z",
    subcategory: {
      name: "Kicks",
      slug: "kicks",
      master_category: {
        name: "Tricking",
        slug: "tricking",
        color: "#ec4899",
      },
    },
    author: {
      username: "trick_master",
      full_name: "Jordan Kim",
      avatar_url: "/placeholder.svg",
    },
  },
  {
    id: "3",
    subcategory_id: "10", // Tumbling
    name: "Back Handspring",
    slug: "back-handspring",
    description:
      "A fundamental tumbling skill where you flip backwards onto your hands and then to your feet.",
    difficulty_level: 5,
    prerequisites: ["Handstand", "Bridge", "Back walkover"],
    step_by_step_guide: [
      {
        step: 1,
        title: "Starting Position",
        description: "Stand tall with arms raised above your head.",
        tips: ["Keep your core tight", "Look straight ahead"],
      },
      {
        step: 2,
        title: "Sit Back",
        description:
          "Sit back as if sitting in a chair, keeping your chest up.",
        tips: ["Don't lean forward", "Keep arms up"],
      },
      {
        step: 3,
        title: "Jump Back",
        description:
          "Jump backwards and up, reaching for the ground with your hands.",
        tips: ["Push through your legs", "Reach back confidently"],
      },
      {
        step: 4,
        title: "Hand Contact",
        description: "Place hands on the ground and push off immediately.",
        tips: ["Keep arms straight", "Push hard through your shoulders"],
      },
      {
        step: 5,
        title: "Land",
        description: "Snap your feet down and land in a standing position.",
        tips: ["Keep feet together", "Bend knees on landing"],
      },
    ],
    tips_and_tricks:
      "Practice on an incline first. Use a spotter initially. Build up shoulder and wrist strength.",
    common_mistakes:
      "Not sitting back enough, hesitating mid-flip, not pushing hard enough off hands.",
    safety_notes:
      "Always use mats. Have a qualified spotter. Ensure wrists are properly warmed up.",
    video_urls: ["https://example.com/back-handspring-demo"],
    image_urls: ["/placeholder.svg"],
    tags: ["intermediate", "tumbling", "gymnastics", "fundamental"],
    view_count: 2103,
    like_count: 234,
    is_published: true,
    created_by: "user-3",
    created_at: "2024-01-05T09:15:00Z",
    updated_at: "2024-01-05T09:15:00Z",
    subcategory: {
      name: "Tumbling",
      slug: "tumbling",
      master_category: {
        name: "Gymnastics",
        slug: "gymnastics",
        color: "#0891b2",
      },
    },
    author: {
      username: "gym_coach",
      full_name: "Sarah Martinez",
      avatar_url: "/placeholder.svg",
    },
  },
];

// Mock API functions - replace with real Supabase queries later
export async function getTricks(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tricks: Trick[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filteredTricks = mockTricks.filter((trick) => trick.is_published);

  if (filters?.category) {
    filteredTricks = filteredTricks.filter(
      (trick) => trick.subcategory?.master_category.slug === filters.category
    );
  }

  if (filters?.subcategory) {
    filteredTricks = filteredTricks.filter(
      (trick) => trick.subcategory?.slug === filters.subcategory
    );
  }

  if (filters?.difficulty) {
    filteredTricks = filteredTricks.filter(
      (trick) => trick.difficulty_level === filters.difficulty
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTricks = filteredTricks.filter(
      (trick) =>
        trick.name.toLowerCase().includes(searchLower) ||
        trick.description.toLowerCase().includes(searchLower) ||
        trick.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  const total = filteredTricks.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 20;

  return {
    tricks: filteredTricks.slice(offset, offset + limit),
    total,
  };
}

export async function getTrickBySlug(slug: string): Promise<Trick | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return (
    mockTricks.find((trick) => trick.slug === slug && trick.is_published) ||
    null
  );
}

export async function createTrick(
  data: Omit<
    Trick,
    | "id"
    | "created_at"
    | "updated_at"
    | "view_count"
    | "like_count"
    | "subcategory"
    | "author"
  >
): Promise<Trick> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newTrick: Trick = {
    ...data,
    id: Date.now().toString(),
    view_count: 0,
    like_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockTricks.push(newTrick);
  return newTrick;
}

export async function updateTrick(
  id: string,
  data: Partial<Trick>
): Promise<Trick> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockTricks.findIndex((trick) => trick.id === id);
  if (index === -1) throw new Error("Trick not found");

  mockTricks[index] = {
    ...mockTricks[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return mockTricks[index];
}

export async function deleteTrick(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = mockTricks.findIndex((trick) => trick.id === id);
  if (index === -1) throw new Error("Trick not found");
  mockTricks.splice(index, 1);
}

export async function incrementTrickViews(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const trick = mockTricks.find((t) => t.id === id);
  if (trick) {
    trick.view_count += 1;
  }
}

export async function toggleTrickLike(
  trickId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const trick = mockTricks.find((t) => t.id === trickId);
  if (!trick) throw new Error("Trick not found");

  // Mock like toggle logic
  const liked = Math.random() > 0.5; // Random for demo
  trick.like_count += liked ? 1 : -1;

  return { liked, likeCount: trick.like_count };
}
