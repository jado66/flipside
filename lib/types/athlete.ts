export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional"
  | "elite";
export type AthleteStatus = "active" | "retired" | "inactive";

export interface Athlete {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  sport: string;
  skill_level: SkillLevel;
  status: AthleteStatus;
  years_experience?: number;
  country?: string;
  city?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  stance?: string;
  instagram_handle?: string;
  youtube_channel?: string;
  tiktok_handle?: string;
  website_url?: string;
  notable_achievements?: string;
  signature_tricks?: string[];
  sponsors?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}
