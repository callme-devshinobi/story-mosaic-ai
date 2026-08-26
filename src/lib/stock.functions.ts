import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  query: z.string().min(2),
  kind: z.enum(["video", "image"]).default("video"),
  orientation: z.string().default("landscape"),
});

const Result = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      provider: z.string(),
      kind: z.string(),
      previewUrl: z.string(),
      pageUrl: z.string(),
      downloadUrl: z.string(),
      author: z.string(),
      width: z.number(),
      height: z.number(),
      durationSec: z.number(),
      license: z.string(),
      relevance: z.number(),
      quality: z.number(),
      recommendedSeconds: z.number(),
    }),
  ),
  providers: z.array(z.object({ name: z.string(), status: z.string() })),
});

type StockResult = z.infer<typeof Result>["results"][number];

function score(text: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = text.toLowerCase();
  const hits = words.filter((w) => hay.includes(w)).length;
  return Math.round((hits / Math.max(words.length, 1)) * 100);
}

function quality(w: number, h: number) {
  const px = w * h;
  if (px >= 3840 * 2160) return 100;
  if (px >= 1920 * 1080) return 85;
  if (px >= 1280 * 720) return 65;
  return 40;
}

export const searchStock = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const pexels = process.env["PEXELS_API_KEY"];
    const pixabay = process.env["PIXABAY_API_KEY"];
    const results: StockResult[] = [];
    const providers: { name: string; status: string }[] = [];

    if (!pexels) providers.push({ name: "Pexels", status: "API key not configured" });
    else {
      try {
        const url =
          data.kind === "video"
            ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(data.query)}&per_page=12&orientation=${data.orientation}`
            : `https://api.pexels.com/v1/search?query=${encodeURIComponent(data.query)}&per_page=12&orientation=${data.orientation}`;
        const res = await fetch(url, { headers: { Authorization: pexels } });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as any;
        const items = data.kind === "video" ? (json.videos ?? []) : (json.photos ?? []);
        for (const it of items) {
          const w = it.width ?? 1920;
          const h = it.height ?? 1080;
          const best =
            data.kind === "video"
              ? [...(it.video_files ?? [])].sort(
                  (a: any, b: any) => (b.width ?? 0) - (a.width ?? 0),
                )[0]
              : null;
          results.push({
            id: `pexels-${it.id}`,
            provider: "Pexels",
            kind: data.kind,
            previewUrl: data.kind === "video" ? (it.image ?? "") : (it.src?.large ?? ""),
            pageUrl: it.url ?? "",
            downloadUrl: data.kind === "video" ? (best?.link ?? "") : (it.src?.original ?? ""),
            author: it.user?.name ?? it.photographer ?? "",
            width: w,
            height: h,
            durationSec: it.duration ?? 0,
            license: "Pexels License — free for commercial use, verify current terms",
            relevance: score(`${it.alt ?? ""} ${it.url ?? ""} ${data.query}`, data.query),
            quality: quality(w, h),
            recommendedSeconds: Math.min(it.duration || 8, 10),
          });
        }
        providers.push({ name: "Pexels", status: "ok" });
      } catch (e) {
        providers.push({ name: "Pexels", status: `failed: ${(e as Error).message}` });
      }
    }

    if (!pixabay) providers.push({ name: "Pixabay", status: "API key not configured" });
    else {
      try {
        const url =
          data.kind === "video"
            ? `https://pixabay.com/api/videos/?key=${pixabay}&q=${encodeURIComponent(data.query)}&per_page=12`
            : `https://pixabay.com/api/?key=${pixabay}&q=${encodeURIComponent(data.query)}&per_page=12&image_type=photo&orientation=horizontal`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as any;
        for (const it of json.hits ?? []) {
          const large = it.videos?.large ?? it.videos?.medium;
          const w = data.kind === "video" ? (large?.width ?? 1920) : (it.imageWidth ?? 1920);
          const h = data.kind === "video" ? (large?.height ?? 1080) : (it.imageHeight ?? 1080);
          results.push({
            id: `pixabay-${it.id}`,
            provider: "Pixabay",
            kind: data.kind,
            previewUrl:
              data.kind === "video"
                ? `https://i.vimeocdn.com/video/${it.picture_id}_640x360.jpg`
                : (it.webformatURL ?? ""),
            pageUrl: it.pageURL ?? "",
            downloadUrl: data.kind === "video" ? (large?.url ?? "") : (it.largeImageURL ?? ""),
            author: it.user ?? "",
            width: w,
            height: h,
            durationSec: it.duration ?? 0,
            license: "Pixabay Content License — verify current commercial-use terms",
            relevance: score(`${it.tags ?? ""} ${data.query}`, data.query),
            quality: quality(w, h),
            recommendedSeconds: Math.min(it.duration || 8, 10),
          });
        }
        providers.push({ name: "Pixabay", status: "ok" });
      } catch (e) {
        providers.push({ name: "Pixabay", status: `failed: ${(e as Error).message}` });
      }
    }

    results.sort((a, b) => b.relevance + b.quality - (a.relevance + a.quality));
    return Result.parse({ results, providers });
  });
