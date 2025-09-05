export interface Skill {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  tier: number;
  completed: boolean;
  category: "basic" | "intermediate" | "advanced" | "master";
}
