import { Skill } from "./skill-types";

export const initialSkills: Skill[] = [
  // Tier 1 - Basic
  {
    id: "back-roll",
    name: "Back Roll",
    description:
      "A basic backward somersault on the ground, foundational for backward movements.",
    prerequisites: [],
    tier: 1,
    completed: false,
    category: "basic",
  },

  // Tier 2 - Basic
  {
    id: "macaco",
    name: "Macaco",
    description:
      "A one-handed backward evasion move from capoeira, similar to a back handspring but with one hand.",
    prerequisites: ["back-roll"],
    tier: 2,
    completed: false,
    category: "basic",
  },

  // Tier 3 - Basic
  {
    id: "back-handspring",
    name: "Back Handspring",
    description:
      "A backward jump onto the hands followed by a spring back to the feet.",
    prerequisites: ["macaco"],
    tier: 3,
    completed: false,
    category: "basic",
  },

  // Tier 4 - Intermediate
  {
    id: "back-tuck",
    name: "Back Tuck",
    description:
      "A backward somersault in a tucked position, building height and rotation control.",
    prerequisites: ["back-handspring"],
    tier: 4,
    completed: false,
    category: "intermediate",
  },

  // Tier 5 - Intermediate
  {
    id: "flash-kick",
    name: "Flash Kick",
    description:
      "A backflip with an extended kick during the rotation to add style and difficulty.",
    prerequisites: ["back-tuck"],
    tier: 5,
    completed: false,
    category: "intermediate",
  },
  {
    id: "gainer-tuck",
    name: "Gainer Tuck",
    description:
      "A forward-running backflip in a tucked position, gaining ground while flipping backward.",
    prerequisites: ["back-tuck"],
    tier: 5,
    completed: false,
    category: "intermediate",
  },

  // Tier 6 - Advanced
  {
    id: "gainer-flash",
    name: "Gainer Flash",
    description:
      "A gainer variation combined with a flash kick, blending forward momentum with stylish kicking.",
    prerequisites: ["flash-kick", "gainer-tuck"],
    tier: 6,
    completed: false,
    category: "advanced",
  },

  // Tier 7 - Advanced
  {
    id: "corkscrew",
    name: "Corkscrew",
    description:
      "An off-axis backward flip incorporating a twist for added complexity.",
    prerequisites: ["gainer-flash"],
    tier: 7,
    completed: false,
    category: "advanced",
  },

  // Tier 8 - Master
  {
    id: "boxcutter",
    name: "Boxcutter",
    description:
      "A hypered corkscrew with a hook kick executed prior to landing.",
    prerequisites: ["corkscrew"],
    tier: 8,
    completed: false,
    category: "master",
  },
  {
    id: "cork-shuriken",
    name: "Cork Shuriken",
    description:
      "A corkscrew variation incorporating a shuriken kick, adding rotational flair.",
    prerequisites: ["corkscrew"],
    tier: 8,
    completed: false,
    category: "master",
  },

  // Tier 9 - Master
  {
    id: "shuriken-cutter",
    name: "Shuriken Cutter",
    description:
      "A combination of shuriken and boxcutter elements, often called shuriken boxcutter.",
    prerequisites: ["boxcutter", "cork-shuriken"],
    tier: 9,
    completed: false,
    category: "master",
  },
];
