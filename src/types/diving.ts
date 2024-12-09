export interface DivePreferences {
  experienceLevel: string;
  interests: string[];
  season: string;
  waterTemperature: string;
  visibility: string;
  currentStrength: string;
  maxDepth: string;
}

export interface ProcessedLocation {
  title: string;
  content: string;
}

export interface ProcessedResponse {
  title: string;
  locations: ProcessedLocation[];
  summary: string;
}

export const waterTemperatureOptions = {
  "Warm (>25°C/77°F)": "Tropical waters, minimal exposure suit needed",
  "Moderate (20-25°C/68-77°F)": "Comfortable with light wetsuit",
  "Cool (15-20°C/59-68°F)": "Thicker wetsuit required",
  "Cold (<15°C/59°F)": "Drysuit recommended",
};

export const visibilityOptions = {
  "Excellent (>30m/100ft)": "Crystal clear waters, perfect for photography",
  "Good (15-30m/50-100ft)": "Very good conditions for most diving activities",
  "Moderate (5-15m/15-50ft)": "Acceptable for most dive types",
  "Limited (<5m/15ft)": "Challenging conditions, for experienced divers",
};

export const currentStrengthOptions = {
  None: "No noticeable current",
  Mild: "Easy to swim against",
  Moderate: "Some effort required",
  Strong: "Experienced divers only",
};

export const maxDepthOptions = {
  "Shallow (<18m/60ft)": "Suitable for all certification levels",
  "Medium (18-30m/60-100ft)": "Advanced certification recommended",
  "Deep (>30m/100ft)": "Technical diving certification required",
};
