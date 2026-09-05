import {
  AI_TYPES,
  GRAPHIC_TYPES,
  STOCK_TYPES,
  type Project,
  type Scene,
  type VisualType,
} from "./types";

export function fmtDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function bucketOf(type: VisualType): "ai" | "stock" | "graphic" {
  if (AI_TYPES.includes(type)) return "ai";
  if (STOCK_TYPES.includes(type)) return "stock";
  return "graphic";
}

export function projectStats(project: Project) {
  const scenes = project.scenes;
  const total = scenes.length;
  const complete = scenes.filter((s) => s.status === "APPROVED").length;
  const uploaded = scenes.filter((s) => s.status === "UPLOADED").length;
  const pending = total - complete;
  const duration = scenes.reduce((a, s) => a + (s.durationSec || 0), 0);

  const group = (pred: (s: Scene) => boolean) => {
    const list = scenes.filter(pred);
    return { total: list.length, done: list.filter((s) => s.status === "APPROVED").length };
  };

  const aiImages = group((s) => s.visualType === "AI_IMAGE");
  const aiVideos = group((s) => s.visualType === "AI_VIDEO" || s.visualType === "ABSTRACT_CINEMATIC");
  const stock = group((s) => STOCK_TYPES.includes(s.visualType));
  const graphics = group((s) => GRAPHIC_TYPES.includes(s.visualType));

  const claims = project.claims;
  const factChecked = claims.filter((c) => c.status === "VERIFIED").length;
  const factPct = claims.length ? Math.round((factChecked / claims.length) * 100) : 0;
  const licenseReview = project.assets.filter((a) => a.commercialUse !== "LIKELY_OK").length;
  const disclosure = scenes.filter((s) => s.disclosureReview).length;

  const mixCounts = { ai: 0, stock: 0, graphic: 0 };
  scenes.forEach((s) => {
    mixCounts[bucketOf(s.visualType)] += s.durationSec || 0;
  });
  const mixTotal = Math.max(1, duration);
  const mix = {
    stock: Math.round((mixCounts.stock / mixTotal) * 100),
    graphic: Math.round((mixCounts.graphic / mixTotal) * 100),
    ai: Math.round((mixCounts.ai / mixTotal) * 100),
  };

  return {
    total,
    complete,
    uploaded,
    pending,
    duration,
    aiImages,
    aiVideos,
    stock,
    graphics,
    factPct,
    claimsTotal: claims.length,
    claimsVerified: factChecked,
    licenseReview,
    disclosure,
    mix,
    needsAi: scenes.filter((s) => AI_TYPES.includes(s.visualType) && s.status !== "APPROVED").length,
    needsStock: scenes.filter((s) => STOCK_TYPES.includes(s.visualType) && s.status !== "APPROVED")
      .length,
  };
}

export interface QcIssue {
  level: "error" | "warning";
  title: string;
  detail: string;
}

export function runQc(project: Project): QcIssue[] {
  const issues: QcIssue[] = [];
  const stats = projectStats(project);

  if (!project.scenes.length)
    issues.push({
      level: "error",
      title: "No scenes",
      detail: "Run the script analysis to build a scene plan.",
    });

  const missing = project.scenes.filter((s) => !s.assetIds.length);
  if (missing.length)
    issues.push({
      level: "error",
      title: `${missing.length} scenes have no asset`,
      detail: `Scenes ${missing
        .slice(0, 12)
        .map((s) => String(s.index).padStart(2, "0"))
        .join(", ")}${missing.length > 12 ? "…" : ""}`,
    });

  const legacyStock = project.assets.filter(
    (a) =>
      !a.hasFile &&
      !a.downloadUrl &&
      /^https?:\/\/(www\.)?(pexels|pixabay)\.com\//i.test(a.sourceUrl),
  );
  if (legacyStock.length)
    issues.push({
      level: "error",
      title: `${legacyStock.length} older stock selections need re-selection`,
      detail: "Open the scene, search again, and select the result so its video file can be included in the full export.",
    });

  const notApproved = project.scenes.filter((s) => s.assetIds.length && s.status !== "APPROVED");
  if (notApproved.length)
    issues.push({
      level: "warning",
      title: `${notApproved.length} scenes await approval`,
      detail: "Review each uploaded or selected asset and mark the scene approved.",
    });

  const lowRes = project.assets.filter((a) => {
    const m = /^(\d+)x(\d+)$/.exec(a.resolution);
    return m ? Number(m[1]) < 1920 : false;
  });
  if (lowRes.length)
    issues.push({
      level: "warning",
      title: `${lowRes.length} assets below 1920px wide`,
      detail: "Low-resolution material will look soft on a 16:9 upload.",
    });

  if (stats.licenseReview)
    issues.push({
      level: "warning",
      title: `${stats.licenseReview} assets need a licence review`,
      detail: "Verify current commercial-use rights before publishing.",
    });

  if (stats.disclosure)
    issues.push({
      level: "warning",
      title: `${stats.disclosure} scenes flagged for AI disclosure`,
      detail: "Realistic synthetic depictions may require YouTube altered-content disclosure.",
    });

  const unverified = project.claims.filter((c) => c.status !== "VERIFIED");
  if (unverified.length)
    issues.push({
      level: "warning",
      title: `${unverified.length} claims without a confirmed source`,
      detail: "Attach a primary source or remove the claim from the narration.",
    });

  const dupes = new Map<string, number>();
  project.assets.forEach((a) => {
    if (!a.sourceUrl) return;
    dupes.set(a.sourceUrl, (dupes.get(a.sourceUrl) ?? 0) + 1);
  });
  const repeated = [...dupes.values()].filter((n) => n > 2).length;
  if (repeated)
    issues.push({
      level: "warning",
      title: "Repeated footage detected",
      detail: `${repeated} assets are reused more than twice. Vary crops or swap in new material.`,
    });

  if (project.voiceover?.durationSec) {
    const drift = Math.abs(project.voiceover.durationSec - stats.duration);
    if (drift > 45)
      issues.push({
        level: "warning",
        title: "Voiceover / timeline mismatch",
        detail: `Voiceover is ${fmtDuration(project.voiceover.durationSec)} vs timeline ${fmtDuration(stats.duration)}.`,
      });
  }

  if (stats.mix.ai > 45)
    issues.push({
      level: "warning",
      title: "Too much AI footage",
      detail: `${stats.mix.ai}% of runtime is AI-generated. Target 25–35% combined.`,
    });

  const target = project.targetMinutes * 60;
  if (stats.total && Math.abs(stats.duration - target) > target * 0.25)
    issues.push({
      level: "warning",
      title: "Runtime off target",
      detail: `Timeline is ${fmtDuration(stats.duration)} against a ${project.targetMinutes} minute target.`,
    });

  let run = 0;
  let chained = 0;
  project.scenes.forEach((s) => {
    if (bucketOf(s.visualType) === "ai") {
      run += 1;
      if (run >= 3) chained += 1;
    } else run = 0;
  });
  if (chained)
    issues.push({
      level: "warning",
      title: "AI visuals chained back to back",
      detail: "Three or more consecutive AI scenes flatten the visual rhythm.",
    });

  return issues;
}

export function briefText(project: Project, scene: Scene) {
  return `SCENE ${String(scene.index).padStart(3, "0")} — ${scene.visualType.replace(/_/g, " ")}
PROJECT: ${project.name}
DURATION: ${scene.durationSec}s   ASPECT: ${project.aspectRatio}
NARRATION: ${scene.narration}

VISUAL: ${scene.objective}
CAMERA: ${scene.camera}
LENS/STYLE: ${project.style}
LIGHTING: ${scene.lighting}
MOOD: ${scene.mood}
COMPOSITION: ${scene.composition}
COLOUR: ${scene.colorDirection}
CONTINUITY: ${scene.continuity}
IMAGE-TO-VIDEO: ${scene.motionPlan.replace(/_/g, " ")} — ${scene.motionReason}

PROMPT:
${scene.aiPrompt}

NEGATIVE PROMPT:
${scene.negativePrompt}`;
}
