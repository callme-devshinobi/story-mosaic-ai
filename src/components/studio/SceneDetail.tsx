import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Loader2, Search, Sparkles, Upload, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchStock } from "@/lib/stock.functions";
import { briefText } from "@/lib/production";
import { uid } from "@/lib/store";
import { mediaDuration, putFile } from "@/lib/files";
import type { Asset, AssetCategory, Project, Scene } from "@/lib/types";
import { AI_TYPES } from "@/lib/types";
import { PriorityDot, StatusBadge, TypeBadge } from "./primitives";

interface Props {
  project: Project;
  scene: Scene | null;
  onClose: () => void;
  update: (mutate: (p: Project) => Project) => void;
}

type StockItem = Awaited<ReturnType<typeof searchStock>>["results"][number];

function categoryFor(scene: Scene): AssetCategory {
  switch (scene.visualType) {
    case "STOCK_VIDEO":
    case "ARCHIVAL":
      return "STOCK_VIDEO";
    case "STOCK_IMAGE":
      return "STOCK_IMAGE";
    case "AI_VIDEO":
    case "ABSTRACT_CINEMATIC":
      return "AI_VIDEO";
    case "AI_IMAGE":
      return "AI_IMAGE";
    case "ORIGINAL_CHART":
      return "CHART";
    case "SCREENSHOT":
      return "SCREENSHOT";
    case "COMPANY_DOCUMENT":
    case "NEWS_HEADLINE":
      return "DOCUMENT";
    default:
      return "GRAPHIC";
  }
}

export function SceneDetail({ project, scene, onClose, update }: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"video" | "image">("video");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StockItem[]>([]);
  const [providers, setProviders] = useState<{ name: string; status: string }[]>([]);

  if (!scene) return null;
  const sceneAssets = project.assets.filter((a) => scene.assetIds.includes(a.id));
  const isAi = AI_TYPES.includes(scene.visualType);

  const patchScene = (patch: Partial<Scene>) =>
    update((p) => {
      p.scenes = p.scenes.map((s) => (s.id === scene.id ? { ...s, ...patch } : s));
      return p;
    });

  const attachAsset = (asset: Asset) =>
    update((p) => {
      p.assets.push(asset);
      p.scenes = p.scenes.map((s) =>
        s.id === scene.id
          ? {
              ...s,
              assetIds: [...s.assetIds, asset.id],
              status: s.status === "PENDING" ? "UPLOADED" : s.status,
            }
          : s,
      );
      return p;
    });

  const removeAsset = (assetId: string) =>
    update((p) => {
      p.assets = p.assets.filter((a) => a.id !== assetId);
      p.scenes = p.scenes.map((s) =>
        s.id === scene.id
          ? {
              ...s,
              assetIds: s.assetIds.filter((id) => id !== assetId),
              status: s.assetIds.length <= 1 ? "PENDING" : s.status,
            }
          : s,
      );
      return p;
    });

  async function runSearch(term?: string) {
    const q = (term ?? query ?? "").trim() || scene!.keywords.join(" ");
    if (!q) {
      toast.error("Add a search term first.");
      return;
    }
    setQuery(q);
    setLoading(true);
    try {
      const res = await searchStock({ data: { query: q, kind, orientation: "landscape" } });
      setResults(res.results);
      setProviders(res.providers);
      if (!res.results.length) toast.info("No stock results — this scene may need AI generation.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const id = uid("asset");
      await putFile(id, file);
      const duration = await mediaDuration(file);
      attachAsset({
        id,
        sceneId: scene!.id,
        name: file.name,
        category: file.type.startsWith("video") ? "AI_VIDEO" : categoryFor(scene!),
        source: "External AI tool / local upload",
        sourceUrl: "",
        previewUrl: "",
        license: "User generated",
        commercialUse: "LIKELY_OK",
        attribution: "",
        durationSec: duration,
        resolution: "",
        notes: "",
        hasFile: true,
        addedAt: new Date().toISOString(),
      });
    }
    toast.success("Asset uploaded and linked to the scene.");
  }

  return (
    <Sheet open={!!scene} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              SCENE {String(scene.index).padStart(3, "0")}
            </span>
            <TypeBadge type={scene.visualType} />
            <StatusBadge status={scene.status} />
            <PriorityDot priority={scene.priority} />
            <span className="text-xs text-muted-foreground">{scene.durationSec}s</span>
          </div>
          <SheetTitle className="text-left text-lg">{scene.subject}</SheetTitle>
          <p className="text-left text-sm leading-relaxed text-muted-foreground">
            “{scene.narration}”
          </p>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-8">
          <div className="panel space-y-2 p-3 text-sm">
            <div className="label-caps">Visual objective</div>
            <p>{scene.objective}</p>
            <div className="label-caps pt-2">Why</div>
            <p className="text-muted-foreground">{scene.reason}</p>
            <div className="label-caps pt-2">Motion plan</div>
            <p>
              <span className="text-primary">{scene.motionPlan.replace(/_/g, " ")}</span>{" "}
              <span className="text-muted-foreground">— {scene.motionReason}</span>
            </p>
            {scene.disclosureReview ? (
              <p className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs text-warning">
                Disclosure review required — realistic synthetic content.
              </p>
            ) : null}
          </div>

          <Tabs defaultValue={isAi ? "brief" : "stock"}>
            <TabsList className="w-full">
              <TabsTrigger value="stock" className="flex-1">
                Stock
              </TabsTrigger>
              <TabsTrigger value="brief" className="flex-1">
                AI brief
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex-1">
                Assets ({sceneAssets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock" className="space-y-3 pt-3">
              <div className="flex flex-wrap gap-2">
                {scene.keywords.map((k) => (
                  <button
                    key={k}
                    onClick={() => runSearch(k)}
                    className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs hover:border-primary/50 hover:text-primary"
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder={scene.keywords.join(", ") || "Search stock"}
                />
                <Button
                  variant="secondary"
                  onClick={() => setKind(kind === "video" ? "image" : "video")}
                >
                  {kind === "video" ? "Video" : "Image"}
                </Button>
                <Button onClick={() => runSearch()} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </div>
              {providers.length ? (
                <p className="text-xs text-muted-foreground">
                  {providers.map((p) => `${p.name}: ${p.status}`).join(" · ")}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                {results.map((r) => (
                  <div key={r.id} className="panel overflow-hidden">
                    {r.previewUrl ? (
                      <img
                        src={r.previewUrl}
                        alt={`${r.provider} stock preview for ${query}`}
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    ) : null}
                    <div className="space-y-1 p-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{r.provider}</span>
                        <span>
                          {r.width}×{r.height}
                          {r.durationSec ? ` · ${r.durationSec}s` : ""}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Relevance {r.relevance} · Quality {r.quality} · Use ~{r.recommendedSeconds}s
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          size="sm"
                          className="h-7 flex-1 text-xs"
                          onClick={() => {
                            attachAsset({
                              id: uid("asset"),
                              sceneId: scene.id,
                              name: `${r.provider} ${r.kind} ${r.id}`,
                              category: r.kind === "video" ? "STOCK_VIDEO" : "STOCK_IMAGE",
                              source: r.provider,
                              sourceUrl: r.pageUrl,
                              // Keep the direct media file URL separately from the provider page.
                              downloadUrl: r.downloadUrl,
                              previewUrl: r.previewUrl,
                              license: r.license,
                              commercialUse: "NEEDS_REVIEW",
                              attribution: r.author,
                              durationSec: r.durationSec || null,
                              resolution: `${r.width}x${r.height}`,
                              notes: `Verify current commercial-use rights before publishing. Source page: ${r.pageUrl}`,
                              hasFile: false,
                              addedAt: new Date().toISOString(),
                            });
                            toast.success("Asset added to the scene.");
                          }}
                        >
                          Select
                        </Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs" asChild>
                          <a href={r.pageUrl} target="_blank" rel="noreferrer noopener">
                            <ExternalLink className="size-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!results.length && !loading ? (
                <div className="panel p-4 text-sm text-muted-foreground">
                  No results yet. If nothing suitable exists,{" "}
                  <span className="text-primary">AI-generated visual required</span> — switch to the
                  AI brief tab.
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="brief" className="space-y-3 pt-3">
              {scene.aiPrompt ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ["Camera", scene.camera],
                      ["Lighting", scene.lighting],
                      ["Mood", scene.mood],
                      ["Composition", scene.composition],
                      ["Colour", scene.colorDirection],
                      ["Transition", scene.transition],
                    ].map(([k, v]) => (
                      <div key={k} className="panel p-2">
                        <div className="label-caps">{k}</div>
                        <div>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label className="label-caps">Generation prompt</Label>
                    <Textarea
                      className="mt-1 min-h-32 font-mono text-xs"
                      value={scene.aiPrompt}
                      onChange={(e) => patchScene({ aiPrompt: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="label-caps">Negative prompt</Label>
                    <Textarea
                      className="mt-1 font-mono text-xs"
                      value={scene.negativePrompt}
                      onChange={(e) => patchScene({ negativePrompt: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(briefText(project, scene));
                      toast.success("Full brief copied.");
                    }}
                  >
                    <Copy /> Copy full brief
                  </Button>
                </>
              ) : (
                <div className="panel p-4 text-sm text-muted-foreground">
                  <Sparkles className="mb-2 size-4 text-primary" />
                  This scene is planned as {scene.visualType.replace(/_/g, " ").toLowerCase()}, so
                  no AI generation brief was produced. You can still write your own prompt below.
                  <Textarea
                    className="mt-2 font-mono text-xs"
                    placeholder="Write a generation prompt…"
                    value={scene.aiPrompt}
                    onChange={(e) => patchScene({ aiPrompt: e.target.value })}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="space-y-3 pt-3">
              <label className="panel flex cursor-pointer flex-col items-center gap-2 border-dashed p-6 text-sm text-muted-foreground hover:border-primary/50">
                <Upload className="size-5 text-primary" />
                Upload the asset you generated externally
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => onUpload(e.target.files)}
                />
              </label>
              {sceneAssets.map((a) => (
                <div key={a.id} className="panel flex items-center gap-3 p-2 text-sm">
                  {a.previewUrl ? (
                    <img
                      src={a.previewUrl}
                      alt={a.name}
                      className="h-12 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-20 items-center justify-center rounded bg-surface-2 text-[10px] text-muted-foreground">
                      {a.category.replace(/_/g, " ")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{a.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.source} · {a.license}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeAsset(a.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!sceneAssets.length}
                  onClick={() => {
                    patchScene({ status: "APPROVED" });
                    toast.success("Scene approved.");
                  }}
                >
                  <Check /> Approve scene
                </Button>
                <Button variant="secondary" onClick={() => patchScene({ status: "PENDING" })}>
                  Reset
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
