export const SL_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
  "Monaragala",
] as const;

export type District = (typeof SL_DISTRICTS)[number];

export const DEFAULT_INTERESTS = [
  "Technology/IT",
  "Software Development",
  "DevOps",
  "Cybersecurity",
  "Data Science & AI",
  "Design/UX",
  "Engineering",
  "Medicine & Health",
  "Science & Research",
  "Business & Entrepreneurship",
  "Marketing",
  "Finance",
  "Law",
  "Education/Academic",
  "Arts & Culture",
  "Environment",
];

export type EventStatus =
  | "pending"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type EventMode = "online" | "physical";

export type UserRole = "attendee" | "club" | "admin";
