// types/trick.ts

import { Trick } from "@/lib/tricks-data";

export interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email?: string;
}

export interface TrickData {
  id?: string;
  subcategory_id?: string;
  name: string;
  slug?: string;
  description: string;
  difficulty_level: number;
  prerequisites: string[];
  step_by_step_guide: StepGuide[];
  tips_and_tricks: string;
  common_mistakes: string;
  safety_notes: string;
  video_urls: string[];
  image_urls: string[];
  tags: string[];
  view_count?: number;
  like_count?: number;
  is_published: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  search_text?: string;
  // New inventor fields
  inventor_user_id?: string | null;
  inventor_name?: string | null;
}

export interface TrickFormProps {
  mode: "view" | "edit";
  trick: TrickData;
  onSubmit?: (data: TrickData) => void;
  loading?: boolean;
  users?: User[]; // Available users for inventor selection
}

// Database insert/update types
export interface TrickInsert {
  subcategory_id?: string;
  name: string;
  slug: string;
  description: string;
  difficulty_level: number;
  prerequisites?: string[];
  step_by_step_guide: StepGuide[];
  tips_and_tricks?: string;
  common_mistakes?: string;
  safety_notes?: string;
  video_urls?: string[];
  image_urls?: string[];
  tags?: string[];
  is_published?: boolean;
  created_by: string;
  inventor_user_id?: string | null;
  inventor_name?: string | null;
}

export interface TrickUpdate {
  name?: string;
  slug?: string;
  description?: string;
  difficulty_level?: number;
  prerequisites?: string[];
  step_by_step_guide?: StepGuide[];
  tips_and_tricks?: string;
  common_mistakes?: string;
  safety_notes?: string;
  video_urls?: string[];
  image_urls?: string[];
  tags?: string[];
  is_published?: boolean;
  inventor_user_id?: string | null;
  inventor_name?: string | null;
  updated_at?: string;
}

// Utility types for inventor handling
export type InventorType = "none" | "user" | "name";

export interface TrickWithInventor extends TrickData {
  inventor_user?: User; // Populated when inventor_user_id is set
}

// Query types for API
export interface GetTricksParams {
  subcategory_id?: string;
  difficulty_min?: number;
  difficulty_max?: number;
  tags?: string[];
  search?: string;
  inventor_user_id?: string;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}

export interface PrerequisiteTrick {
  id: string;
  name: string;
  slug: string;
  subcategory: {
    slug: string;
    master_category: {
      slug: string;
    };
  };
}

// This type represents how we'll handle prerequisites internally
export type EnhancedPrerequisite = {
  text: string;
  linkedTrick?: PrerequisiteTrick;
};

// Add a helper type for the API response
export interface TrickWithLinkedPrerequisites extends Trick {
  prerequisite_tricks?: PrerequisiteTrick[];
}
