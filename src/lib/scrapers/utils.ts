import type { ScrapedEvent } from "./types";

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export function parseDate(raw: string): Date {
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new Error(`Cannot parse date: "${raw}"`);
  return d;
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Maps external tag strings → UniPlaza interest names
const INTEREST_MAP: Record<string, string> = {
  // Devpost / hackathon tags
  "machine learning": "Data Science & AI",
  "artificial intelligence": "Data Science & AI",
  "ai": "Data Science & AI",
  "ml": "Data Science & AI",
  "data science": "Data Science & AI",
  "deep learning": "Data Science & AI",
  "nlp": "Data Science & AI",
  "web": "Software Development",
  "web development": "Software Development",
  "mobile": "Software Development",
  "mobile development": "Software Development",
  "software": "Software Development",
  "open source": "Software Development",
  "blockchain": "Software Development",
  "web3": "Software Development",
  "game": "Software Development",
  "games": "Software Development",
  "cloud": "DevOps",
  "devops": "DevOps",
  "infrastructure": "DevOps",
  "kubernetes": "DevOps",
  "docker": "DevOps",
  "security": "Cybersecurity",
  "cybersecurity": "Cybersecurity",
  "privacy": "Cybersecurity",
  "design": "Design/UX",
  "ui/ux": "Design/UX",
  "ux": "Design/UX",
  "ui": "Design/UX",
  "fintech": "Finance",
  "finance": "Finance",
  "healthtech": "Medicine & Health",
  "health": "Medicine & Health",
  "healthcare": "Medicine & Health",
  "medtech": "Medicine & Health",
  "edtech": "Education/Academic",
  "education": "Education/Academic",
  "learning": "Education/Academic",
  "sustainability": "Environment",
  "climate": "Environment",
  "environment": "Environment",
  "green tech": "Environment",
  "social impact": "Business & Entrepreneurship",
  "entrepreneurship": "Business & Entrepreneurship",
  "startup": "Business & Entrepreneurship",
  "iot": "Engineering",
  "hardware": "Engineering",
  "robotics": "Engineering",
  "embedded": "Engineering",
  "research": "Science & Research",
  "science": "Science & Research",
  "marketing": "Marketing",
  "legal": "Law",
  "law": "Law",
  "arts": "Arts & Culture",
  "creative": "Arts & Culture",
  "music": "Arts & Culture",

  // Eventbrite categories (title case)
  "science & technology": "Technology/IT",
  "technology": "Technology/IT",
  "computers": "Technology/IT",
  "business & professional": "Business & Entrepreneurship",
  "business": "Business & Entrepreneurship",
  "health & wellness": "Medicine & Health",
  "food & drink": "Arts & Culture",
  "community & culture": "Arts & Culture",
  "environment & sustainability": "Environment",
  "marketing & media": "Marketing",
  "sports & fitness": "Science & Research",
};

interface InterestDoc {
  _id: unknown;
  name: string;
}

export function mapInterests(rawTags: string[], interestDocs: InterestDoc[]): unknown[] {
  const matched = new Set<string>();

  for (const tag of rawTags) {
    const lower = tag.toLowerCase().trim();
    const mapped = INTEREST_MAP[lower];
    if (mapped) matched.add(mapped);
  }

  if (matched.size === 0) matched.add("Technology/IT");

  return interestDocs
    .filter((doc) => matched.has(doc.name))
    .map((doc) => doc._id);
}

// Maps Eventbrite location strings → SL district names
export const EVENTBRITE_DISTRICT_MAP: Record<string, string> = {
  "Western Province": "Colombo",
  "Colombo": "Colombo",
  "Gampaha": "Gampaha",
  "Kalutara": "Kalutara",
  "Central Province": "Kandy",
  "Kandy": "Kandy",
  "Matale": "Matale",
  "Nuwara Eliya": "Nuwara Eliya",
  "Southern Province": "Galle",
  "Galle": "Galle",
  "Matara": "Matara",
  "Hambantota": "Hambantota",
  "Northern Province": "Jaffna",
  "Jaffna": "Jaffna",
  "Kilinochchi": "Kilinochchi",
  "Mannar": "Mannar",
  "Vavuniya": "Vavuniya",
  "Mullaitivu": "Mullaitivu",
  "Eastern Province": "Trincomalee",
  "Trincomalee": "Trincomalee",
  "Batticaloa": "Batticaloa",
  "Ampara": "Ampara",
  "North Western Province": "Kurunegala",
  "Kurunegala": "Kurunegala",
  "Puttalam": "Puttalam",
  "North Central Province": "Anuradhapura",
  "Anuradhapura": "Anuradhapura",
  "Polonnaruwa": "Polonnaruwa",
  "Uva Province": "Badulla",
  "Badulla": "Badulla",
  "Monaragala": "Monaragala",
  "Sabaragamuwa Province": "Ratnapura",
  "Ratnapura": "Ratnapura",
  "Kegalle": "Kegalle",
};

export function mapEventbriteDistrict(region?: string, city?: string): string | undefined {
  if (city && EVENTBRITE_DISTRICT_MAP[city]) return EVENTBRITE_DISTRICT_MAP[city];
  if (region && EVENTBRITE_DISTRICT_MAP[region]) return EVENTBRITE_DISTRICT_MAP[region];
  return undefined;
}

export { type ScrapedEvent };
