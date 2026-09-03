import { getFileUrl } from "./files";
import type { Project, Scene } from "./types";

interface RenderItem {
  scene: Scene;
  url: string | null;
  kind: "video" | "image" | null;
}

type MediaEl = HTMLImageElement | HTMLVideoElement | null;

function dimsFor(aspectRatio: string): { w: number; h: number } {
  if (aspectRatio.startsWith("9:16")) return { w: 1080, h: 1920 };
  if (aspectRatio.startsWith("1:1")) return { w: 1080, h: 1080 };
  if (aspectRatio.startsWith("4:5")) return { w: 1080, h: 1350 };
  return { w: 1920, h: 1080 };
}

function pickMime(): { mime: string; ext: string } {
  const candidates: Array<[string, string]> = [
    ['video/mp4;codecs="avc1.42E01E"', "mp4"],
    ["video/mp4", "mp4"],
    ["video/webm;codecs=vp9", "webm"],
    ["video/webm", "webm"],
  ];
  for (const [mime, ext] of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime))
      return { mime, ext };
  }
  return { mime: "", ext: "webm" };
}

async function resolveItems(project: Project): Promise<RenderItem[]> {
  const items: RenderItem[] = [];
  for (const scene of project.scenes) {
    const asset = project.assets.find((a) => scene.assetIds.includes(a.id));
    let url: string | null = null;
    let kind: RenderItem["kind"] = null;
    if (asset) {
      if (asset.hasFile) url = await getFileUrl(asset.id);
      if (!url) url = asset.sourceUrl || asset.previewUrl || null;
      if (url) {
        kind =
          asset.category.includes("VIDEO") || /\.(mp4|webm|mov)(\?|#|$)/i.test(url)
            ? "video"
            : "image";
      }
    }
    items.push({ scene, url, kind });
  }
  return items;
}

function loadMedia(item: RenderItem): Promise<MediaEl> {
  if (!item.url || !item.kind) return Promise.resolve(null);
  if (item.kind === "image") {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = item.url!;
    });
  }
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.oncanplay = () => resolve(video);
    video.onerror = () => resolve(null);
    video.src = item.url!;
    // Safety timeout so a hanging remote video doesn't stall the export.
    setTimeout(() => resolve(video.readyState >= 2 ? video : null), 15000);
  });
}

function srcSize(el: Exclude<MediaEl, null>): { w: number; h: number } {
  return el instanceof HTMLVideoElement
    ? { w: el.videoWidth || 16, h: el.videoHeight || 9 }
    : { w: el.naturalWidth || 16, h: el.naturalHeight || 9 };
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  el: Exclude<MediaEl, null>,
  W: number,
  H: number,
  scale: number,
  panX: number,
  panY: number,
) {
  const { w, h } = srcSize(el);
  const cover = Math.max(W / w, H / h) * scale;
  const dw = w * cover;
  const dh = h * cover;
  const maxX = Math.max(0, (dw - W) / 2);
  const maxY = Math.max(0, (dh - H) / 2);
  const dx = W / 2 - dw / 2 + panX * maxX;
  const dy = H / 2 - dh / 2 + panY * maxY;
  ctx.drawImage(el, dx, dy, dw, dh);
}

function drawSlate(ctx: CanvasRenderingContext2D, W: number, H: number, scene: Scene) {
  ctx.fillStyle = "#101418";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e8e4da";
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.round(H / 22)}px Georgia, serif`;
  ctx.fillText(`SCENE ${String(scene.index).padStart(3, "0")}`, W / 2, H / 2 - H / 40);
  ctx.fillStyle = "#8b949c";
  ctx.font = `${Math.round(H / 38)}px system-ui, sans-serif`;
  const label = (scene.subject || "Missing asset").slice(0, 60);
  ctx.fillText(label, W / 2, H / 2 + H / 28);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  item: RenderItem,
  el: MediaEl,
  W: number,
  H: number,
  localT: number,
) {
  const dur = Math.max(0.1, item.scene.durationSec);
  const p = Math.min(1, Math.max(0, localT / dur));
  const dir = item.scene.index % 2 === 0 ? 1 : -1;
  // Ken Burns: slow zoom-in with alternating drift.
  const scale = 1 + 0.09 * p;
  const panX = dir * (p - 0.5);
  const panY = (item.scene.index % 3 === 0 ? -1 : 1) * (p - 0.5) * 0.5;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  if (el) drawCover(ctx, el, W, H, scale, panX, panY);
  else drawSlate(ctx, W, H, item.scene);
}

export interface RenderResult {
  blob: Blob;
  ext: string;
  mime: string;
}

export async function renderSilentVideo(
  project: Project,
  onProgress: (pct: number, label: string) => void,
  signal?: AbortSignal,
): Promise<RenderResult> {
  const scenes = [...project.scenes].sort((a, b) => a.index - b.index);
  if (!scenes.length) throw new Error("No scenes to render.");

  const { w: W, h: H } = dimsFor(project.aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  onProgress(0, "Loading assets…");
  const items = await resolveItems({ ...project, scenes });
  const media = await Promise.all(items.map(loadMedia));

  // Start all video elements so their frames advance during capture.
  for (const el of media) {
    if (el instanceof HTMLVideoElement) {
      try {
        await el.play();
      } catch {
        /* silent autoplay may be blocked until a gesture; export is user-triggered */
      }
    }
  }

  const { mime, ext } = pickMime();
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(
    stream,
    mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : { videoBitsPerSecond: 8_000_000 },
  );
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  const starts: number[] = [];
  let acc = 0;
  for (const s of scenes) {
    starts.push(acc);
    acc += Math.max(0.5, s.durationSec || 0.5);
  }
  const total = acc;
  const FADE = 0.6;

  recorder.start(1000);
  const t0 = performance.now();
  let lastPct = -1;

  await new Promise<void>((resolve, reject) => {
    const frame = (now: number) => {
      if (signal?.aborted) {
        reject(new Error("Export cancelled."));
        return;
      }
      const t = (now - t0) / 1000;
      if (t >= total) {
        resolve();
        return;
      }
      let i = scenes.length - 1;
      for (let k = 0; k < scenes.length; k++) {
        if (t < starts[k] + Math.max(0.5, scenes[k].durationSec || 0.5)) {
          i = k;
          break;
        }
      }
      const local = t - starts[i];
      drawScene(ctx, items[i], media[i], W, H, local);
      // Crossfade in from the previous scene unless the scene requests a hard cut.
      const transition = (items[i].scene.transition || "").toLowerCase();
      if (i > 0 && local < FADE && !transition.includes("cut")) {
        const prevDur = Math.max(0.5, scenes[i - 1].durationSec || 0.5);
        ctx.globalAlpha = 1 - local / FADE;
        drawScene(ctx, items[i - 1], media[i - 1], W, H, prevDur);
        ctx.globalAlpha = 1;
      }
      const pct = Math.round((t / total) * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        onProgress(pct, `Rendering scene ${i + 1} of ${scenes.length}`);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }).finally(() => {
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch {
      /* already stopped */
    }
  });

  for (const el of media) if (el instanceof HTMLVideoElement) el.pause();

  await new Promise<void>((resolve) => {
    if (recorder.state === "inactive") return resolve();
    recorder.onstop = () => resolve();
  });

  const blob = new Blob(chunks, { type: mime || "video/webm" });
  if (!blob.size) throw new Error("Export produced no data.");
  return { blob, ext, mime: mime || "video/webm" };
}
