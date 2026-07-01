export const DESTINATION_TYPES = [
  "city",
  "beach",
  "mountain",
  "cultural",
  "nature",
  "island",
  "village",
];

export const BUDGET_TIERS = ["budget", "mid", "premium"];
export const DIFFICULTIES = ["easy", "moderate", "challenging"];
export const STATUSES = ["draft", "published", "archived"];
export const TAG_CATEGORIES = ["experience", "vibe", "activity"];

export const ATTRACTION_TYPES = [
  "temple",
  "museum",
  "landmark",
  "market",
  "park",
  "viewpoint",
  "historic_site",
];

export const ACTIVITY_TYPES = [
  "cultural",
  "adventure",
  "food",
  "nature",
  "shopping",
  "wellness",
];

export const CUISINE_TYPES = [
  "Street food",
  "Local dish",
  "Dessert",
  "Drink",
  "Fine dining",
];
export const SPICE_LEVELS = ["mild", "medium", "hot"];
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "dessert"];
export const TIME_OF_DAY_OPTIONS = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "anytime",
];
export const COST_UNITS = ["per person", "per group", "per day", "fixed"];

export const MONTH_OPTIONS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export const EMPTY_ATTRACTION = {
  name: "",
  attraction_type: "",
  description: "",
  latitude: "",
  longitude: "",
  address: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  existing_gallery_images: [],
  removed_gallery_image_ids: [],
  budget_tier: "",
  avg_duration_hours: "",
  best_time_of_day: "",
  entrance_fee_required: false,
  approx_entrance_fee: "",
  sort_order: "",
  is_featured: false,
  picking_reasons: "",
  notes: "",
};

export const EMPTY_ACTIVITY = {
  name: "",
  activity_type: "",
  description: "",
  difficulty_level: "",
  budget_tier: "",
  approx_cost: "",
  duration_hours: "",
  best_season: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  existing_gallery_images: [],
  removed_gallery_image_ids: [],
  booking_required: false,
  is_featured: false,
  picking_reasons: "",
  notes: "",
};

export const EMPTY_CUISINE = {
  name: "",
  cuisine_type: "",
  description: "",
  spice_level: "",
  meal_type: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  existing_gallery_images: [],
  removed_gallery_image_ids: [],
  is_vegetarian_friendly: false,
  is_featured: false,
  approx_cost: "",
  picking_reasons: "",
  notes: "",
};
