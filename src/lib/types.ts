export type VisualType =
  | "STOCK_VIDEO"
  | "STOCK_IMAGE"
  | "AI_IMAGE"
  | "AI_VIDEO"
  | "ORIGINAL_CHART"
  | "INFOGRAPHIC"
  | "MAP"
  | "TIMELINE"
  | "SCREENSHOT"
  | "ARCHIVAL"
  | "COMPANY_DOCUMENT"
  | "NEWS_HEADLINE"
  | "MOTION_GRAPHIC"
  | "ABSTRACT_CINEMATIC";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type SceneStatus = "PENDING" | "UPLOADED" | "APPROVED";
export type MotionPlan = "KEEP_STATIC" | "ANIMATE_IN_EDITOR" | "CONVERT_TO_VIDEO";

export interface Scene {
  id: string;
  index: number;
  narration: string;
  durationSec: number;
  subject: string;
  objective: string;
  visualType: VisualType;
  priority: Priority;
  reason: string;
  keywords: string[];
  needsAi: boolean;
  motionPlan: MotionPlan;
  motionReason: string;
  animationStyle: string;
  camera: string;
  lighting: string;
  mood: string;
  composition: string;
  colorDirection: string;
  transition: string;
  aiPrompt: string;
  negativePrompt: string;
  continuity: string;
  licenseNotes: string;
  disclosureReview: boolean;
  status: SceneStatus;
  assetIds: string[];
}

export type AssetCategory =
  | "STOCK_VIDEO"
  | "STOCK_IMAGE"
  | "AI_IMAGE"
  | "AI_VIDEO"
  | "CHART"
  | "GRAPHIC"
  | "SCREENSHOT"
  | "DOCUMENT"
  | "VOICEOVER"
  | "MUSIC"
  | "SFX";

export interface Asset {
  id: string;
  sceneId: string | null;
  name: string;
  category: AssetCategory;
  source: string;
  sourceUrl: string;
  /** Direct media file URL, when a provider also gives a separate listing page URL. */
  downloadUrl?: string;
  previewUrl: string;
  license: string;
  commercialUse: "UNKNOWN" | "LIKELY_OK" | "NEEDS_REVIEW";
  attribution: string;
  durationSec: number | null;
  resolution: string;
  notes: string;
  hasFile: boolean;
  addedAt: string;
}

export interface Claim {
  id: string;
  sceneId: string | null;
  text: string;
  kind: string;
  sourceType: "PRIMARY" | "SECONDARY" | "USER_PROVIDED" | "UNVERIFIED";
  source: string;
  status: "VERIFIED" | "NEEDS_SOURCE" | "FLAGGED";
}

export interface Project {
  id: string;
  name: string;
  videoTitle: string;
  targetMinutes: number;
  aspectRatio: string;
  category: string;
  style: string;
  audience: string;
  script: string;
  scenes: Scene[];
  assets: Asset[];
  claims: Claim[];
  voiceover: { name: string; durationSec: number | null } | null;
  createdAt: string;
  updatedAt: string;
}

export const VISUAL_TYPE_LABELS: Record<VisualType, string> = {
  STOCK_VIDEO: "Stock video",
  STOCK_IMAGE: "Stock image",
  AI_IMAGE: "AI image",
  AI_VIDEO: "AI video",
  ORIGINAL_CHART: "Original chart",
  INFOGRAPHIC: "Infographic",
  MAP: "Map",
  TIMELINE: "Timeline",
  SCREENSHOT: "Screenshot",
  ARCHIVAL: "Archival",
  COMPANY_DOCUMENT: "Company document",
  NEWS_HEADLINE: "News headline",
  MOTION_GRAPHIC: "Motion graphic",
  ABSTRACT_CINEMATIC: "Abstract cinematic",
};

export const AI_TYPES: VisualType[] = ["AI_IMAGE", "AI_VIDEO", "ABSTRACT_CINEMATIC"];
export const STOCK_TYPES: VisualType[] = ["STOCK_VIDEO", "STOCK_IMAGE", "ARCHIVAL"];
export const GRAPHIC_TYPES: VisualType[] = [
  "ORIGINAL_CHART",
  "INFOGRAPHIC",
  "MAP",
  "TIMELINE",
  "SCREENSHOT",
  "COMPANY_DOCUMENT",
  "NEWS_HEADLINE",
  "MOTION_GRAPHIC",
];
