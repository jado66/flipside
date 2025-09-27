// Test file to validate XP calculations
import {
  calculateTrickCreationXP,
  calculateTrickEditXP,
} from "./lib/xp/trick-xp";

// Test trick creation XP calculation
const testTrickData = {
  name: "Test Trick",
  slug: "test-trick",
  description:
    "A comprehensive test trick with detailed description that is over 50 characters long",
  step_by_step_guide: [
    { title: "Step 1", description: "First step" },
    { title: "Step 2", description: "Second step" },
  ],
  tips_and_tricks: "Some useful tips for performing this trick effectively",
  common_mistakes: "Common mistakes to avoid when learning",
  safety_notes: "Important safety considerations",
  video_urls: ["https://youtube.com/watch?v=test1"],
  image_urls: [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
  ],
  tags: ["beginner", "fundamental", "basic"],
  prerequisite_ids: ["uuid1", "uuid2"],
  source_urls: ["https://source.com/reference"],
  difficulty_level: 8,
  is_combo: true,
  subcategory_id: "test-subcategory",
  is_published: true,
};

// Test XP calculation
console.log("=== Testing Trick Creation XP ===");
const creationXP = calculateTrickCreationXP(testTrickData);
console.log("Expected range: 50-200 XP");
console.log("Calculated XP:", creationXP);

// Test trick editing XP calculation
const oldTrickData = {
  name: "Old Trick Name",
  description: "Old description",
  tips_and_tricks: "Old tips",
  video_urls: ["https://old-video.com"],
  tags: ["old", "basic"],
};

const newTrickData = {
  name: "Updated Trick Name",
  description:
    "New comprehensive description that is much longer and more detailed than before",
  tips_and_tricks:
    "Updated tips with much more comprehensive information about how to perform this trick correctly",
  video_urls: ["https://new-video1.com", "https://new-video2.com"],
  tags: ["updated", "comprehensive", "detailed", "advanced"],
};

console.log("\n=== Testing Trick Edit XP ===");
const editXP = calculateTrickEditXP(oldTrickData, newTrickData);
console.log("Expected range: 5-150 XP");
console.log("Calculated XP:", editXP);

export {};
