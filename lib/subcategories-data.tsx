// Mock data and functions for subcategories - replace with real Supabase queries later

export interface Subcategory {
  id: string
  master_category_id: string
  name: string
  description: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  trick_count?: number
  master_category?: {
    name: string
    slug: string
    color: string
  }
}

// Mock subcategories data
const mockSubcategories: Subcategory[] = [
  // Parkour subcategories
  {
    id: "1",
    master_category_id: "1",
    name: "Vaults",
    description: "Techniques for overcoming obstacles efficiently",
    slug: "vaults",
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 45,
    master_category: { name: "Parkour", slug: "parkour", color: "#164e63" },
  },
  {
    id: "2",
    master_category_id: "1",
    name: "Precision Jumps",
    description: "Accurate jumping techniques",
    slug: "precision-jumps",
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 32,
    master_category: { name: "Parkour", slug: "parkour", color: "#164e63" },
  },
  {
    id: "3",
    master_category_id: "1",
    name: "Wall Runs",
    description: "Techniques for running up and along walls",
    slug: "wall-runs",
    sort_order: 3,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 28,
    master_category: { name: "Parkour", slug: "parkour", color: "#164e63" },
  },
  {
    id: "4",
    master_category_id: "1",
    name: "Rolls",
    description: "Safe landing and momentum techniques",
    slug: "rolls",
    sort_order: 4,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 51,
    master_category: { name: "Parkour", slug: "parkour", color: "#164e63" },
  },
  // Tricking subcategories
  {
    id: "5",
    master_category_id: "2",
    name: "Kicks",
    description: "Martial arts inspired kicking techniques",
    slug: "kicks",
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 67,
    master_category: { name: "Tricking", slug: "tricking", color: "#ec4899" },
  },
  {
    id: "6",
    master_category_id: "2",
    name: "Flips",
    description: "Forward and backward flipping movements",
    slug: "flips",
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 89,
    master_category: { name: "Tricking", slug: "tricking", color: "#ec4899" },
  },
  {
    id: "7",
    master_category_id: "2",
    name: "Twists",
    description: "Rotational movements around vertical axis",
    slug: "twists",
    sort_order: 3,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 47,
    master_category: { name: "Tricking", slug: "tricking", color: "#ec4899" },
  },
  // Gymnastics subcategories
  {
    id: "8",
    master_category_id: "3",
    name: "Floor Skills",
    description: "Ground-based gymnastics movements",
    slug: "floor-skills",
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 34,
    master_category: { name: "Gymnastics", slug: "gymnastics", color: "#0891b2" },
  },
  {
    id: "9",
    master_category_id: "3",
    name: "Handstands",
    description: "Balance and strength-based inverted positions",
    slug: "handstands",
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 23,
    master_category: { name: "Gymnastics", slug: "gymnastics", color: "#0891b2" },
  },
  {
    id: "10",
    master_category_id: "3",
    name: "Tumbling",
    description: "Dynamic acrobatic sequences",
    slug: "tumbling",
    sort_order: 3,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    trick_count: 32,
    master_category: { name: "Gymnastics", slug: "gymnastics", color: "#0891b2" },
  },
]

// Mock API functions - replace with real Supabase queries later
export async function getSubcategoriesByMasterCategory(masterCategoryId: string): Promise<Subcategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockSubcategories
    .filter((sub) => sub.master_category_id === masterCategoryId && sub.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockSubcategories.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getSubcategoryBySlug(
  masterCategorySlug: string,
  subcategorySlug: string,
): Promise<Subcategory | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return (
    mockSubcategories.find((sub) => sub.slug === subcategorySlug && sub.master_category?.slug === masterCategorySlug) ||
    null
  )
}

export async function createSubcategory(
  data: Omit<Subcategory, "id" | "created_at" | "updated_at" | "master_category">,
): Promise<Subcategory> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const newSubcategory: Subcategory = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockSubcategories.push(newSubcategory)
  return newSubcategory
}

export async function updateSubcategory(id: string, data: Partial<Subcategory>): Promise<Subcategory> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = mockSubcategories.findIndex((sub) => sub.id === id)
  if (index === -1) throw new Error("Subcategory not found")

  mockSubcategories[index] = {
    ...mockSubcategories[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return mockSubcategories[index]
}

export async function deleteSubcategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = mockSubcategories.findIndex((sub) => sub.id === id)
  if (index === -1) throw new Error("Subcategory not found")
  mockSubcategories.splice(index, 1)
}
