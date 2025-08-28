// Mock data and functions for categories - replace with real Supabase queries later

export interface MasterCategory {
  id: string
  name: string
  description: string
  slug: string
  icon_name: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  trick_count?: number
}

// Mock master categories data
const mockMasterCategories: MasterCategory[] = [
  {
    id: "1",
    name: "Parkour",
    description: "Movement discipline focused on efficient navigation through environments",
    slug: "parkour",
    icon_name: "zap",
    color: "#164e63",
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 156,
  },
  {
    id: "2",
    name: "Tricking",
    description: "Martial arts and gymnastics-inspired acrobatic movements",
    slug: "tricking",
    icon_name: "rotate-ccw",
    color: "#ec4899",
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 203,
  },
  {
    id: "3",
    name: "Gymnastics",
    description: "Traditional gymnastics movements and skills",
    slug: "gymnastics",
    icon_name: "activity",
    color: "#0891b2",
    sort_order: 3,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 89,
  },
  {
    id: "4",
    name: "Trampwall",
    description: "Acrobatic movements performed on trampolines and walls",
    slug: "trampwall",
    icon_name: "bounce",
    color: "#7c3aed",
    sort_order: 4,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 67,
  },
]

// Mock API functions - replace with real Supabase queries later
export async function getMasterCategories(): Promise<MasterCategory[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockMasterCategories.filter((cat) => cat.is_active).sort((a, b) => a.sort_order - b.sort_order)
}

export async function getAllMasterCategories(): Promise<MasterCategory[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockMasterCategories.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getMasterCategoryBySlug(slug: string): Promise<MasterCategory | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockMasterCategories.find((cat) => cat.slug === slug) || null
}

export async function createMasterCategory(
  data: Omit<MasterCategory, "id" | "created_at" | "updated_at">,
): Promise<MasterCategory> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const newCategory: MasterCategory = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockMasterCategories.push(newCategory)
  return newCategory
}

export async function updateMasterCategory(id: string, data: Partial<MasterCategory>): Promise<MasterCategory> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = mockMasterCategories.findIndex((cat) => cat.id === id)
  if (index === -1) throw new Error("Category not found")

  mockMasterCategories[index] = {
    ...mockMasterCategories[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return mockMasterCategories[index]
}

export async function deleteMasterCategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = mockMasterCategories.findIndex((cat) => cat.id === id)
  if (index === -1) throw new Error("Category not found")
  mockMasterCategories.splice(index, 1)
}
