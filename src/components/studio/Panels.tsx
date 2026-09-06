import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clapperboard, Download, FileWarning, Music, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDuration, projectStats, runQc } from "@/lib/production";
import { renderSilentVideo } from "@/lib/export";
import { mediaDuration } from "@/lib/files";
import type { Project } from "@/lib/types";
import { StatTile } from "./primitives";

type Update = (mutate: (p: Project) => Project) => void;

export function Dashboard({ project }: { project: Project }) {
  const s = projectStats(project);
  const pct = s.total ? Math.round((s.complete / s.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="label-caps">Production status</div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">{project.videoTitle || project.name}</h2>
          <span className="font-mono text-sm text-muted-foreground">
            {fmtDuration(s.duration)} timeline · target {project.targetMinutes}:00 · {project.aspectRatio}
          </span>
        </div>
        <Progress value={pct} className="mt-4" />
        <div className="mt-2 text-sm text-muted-foreground">
          {s.complete} of {s.total} scenes complete ({pct}%) · {s.pending} remaining
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Scenes" value={s.total} hint={`${s.complete} complete`} />
        <StatTile label="AI images" value={`${s.aiImages.done}/${s.aiImages.total}`} tone="primary" />
        <StatTile label="AI videos" value={`${s.aiVideos.done}/${s.aiVideos.total}`} tone="primary" />
        <StatTile label="Stock" value={`${s.stock.done}/${s.stock.total}`} />
        <StatTile label="Graphics" value={`${s.graphics.done}/${s.graphics.total}`} />
        <StatTile
          label="Fact check"
          value={`${s.factPct}%`}
          hint={`${s.claimsVerified}/${s.claimsTotal} claims sourced`}
          tone={s.factPct === 100 ? "success" : "warning"}
        />
        <StatTile
          label="Licence review"
          value={s.licenseReview}
          hint="assets to verify"
          tone={s.licenseReview ? "warning" : "success"}
        />
        <StatTile
          label="Disclosure"
          value={s.disclosure}
          hint="scenes to review"
          tone={s.disclosure ? "warning" : "success"}
        />
      </div>

      <div className="panel p-5">
        <div className="label-caps">Visual diversity mix</div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="bg-accent" style={{ width: `${s.mix.stock}%` }} />
          <div className="bg-success" style={{ width: `${s.mix.graphic}%` }} />
          <div className="bg-primary" style={{ width: `${s.mix.ai}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-accent">■</span> Stock / archival {s.mix.stock}%{" "}
            <span className="text-muted-foreground">(target 35–40)</span>
          </div>
          <div>
            <span className="text-success">■</span> Graphics {s.mix.graphic}%{" "}
            <span className="text-muted-foreground">(target 20–25)</span>
          </div>
          <div>
            <span className="text-primary">■</span> AI visuals {s.mix.ai}%{" "}
            <span className="text-muted-foreground">(target 25–35)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetLibrary({ project, update }: { project: Project; update: Update }) {
  const exportBlocked = runQc(project).some((issue) => issue.level === "error");
  const grouped = useMemo(() => {
    const map = new Map<string, typeof project.assets>();
    project.assets.forEach((a) => {
      map.set(a.category, [...(map.get(a.category) ?? []), a]);
    });
    return [...map.entries()];
  }, [project.assets]);

  if (!project.assets.length)
    return (
      <div className="panel p-6 text-sm text-muted-foreground">
        No assets yet. Select stock in a scene or upload the AI assets you generated externally.
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="label-caps">Full video export</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Assemble every selected scene asset into one silent video.
          </p>
        </div>
        <SilentVideoExport project={project} compact disabled={exportBlocked} />
      </div>
      {grouped.map(([category, assets]) => (
        <div key={category}>
          <div className="label-caps mb-2">
            {category.replace(/_/g, " ")} · {assets.length}
          </div>
          <div className="panel divide-y divide-border">
            {assets.map((a) => {
              const scene = project.scenes.find((s) => s.id === a.sceneId);
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                  {a.previewUrl ? (
                    <img src={a.previewUrl} alt={a.name} className="h-12 w-20 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-20 items-center justify-center rounded bg-surface-2 text-[10px] text-muted-foreground">
                      FILE
                    </div>
                  )}
                  <div className="min-w-40 flex-1">
                    <div className="truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {scene ? `Scene ${String(scene.index).padStart(3, "0")} · ` : ""}
                      {a.source}
                      {a.resolution ? ` · ${a.resolution}` : ""}
                      {a.durationSec ? ` · ${a.durationSec}s` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.license}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={a.commercialUse === "LIKELY_OK" ? "secondary" : "default"}
                    onClick={() =>
                      update((p) => {
                        p.assets = p.assets.map((x) =>
                          x.id === a.id
                            ? {
                                ...x,
                                commercialUse:
                                  x.commercialUse === "LIKELY_OK" ? "NEEDS_REVIEW" : "LIKELY_OK",
                              }
                            : x,
                        );
                        return p;
                      })
                    }
                  >
                    {a.commercialUse === "LIKELY_OK" ? "Licence cleared" : "Mark licence verified"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FactCheck({ project, update }: { project: Project; update: Update }) {
  if (!project.claims.length)
    return (
      <div className="panel p-6 text-sm text-muted-foreground">
        No claims extracted yet. Run the script analysis first.
      </div>
    );

  return (
    <div className="panel divide-y divide-border">
      {project.claims.map((c) => {
        const scene = project.scenes.find((s) => s.id === c.sceneId);
        return (
          <div key={c.id} className="space-y-2 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {scene ? <span className="font-mono">SCENE {String(scene.index).padStart(3, "0")}</span> : null}
              <span className="rounded-full border border-border px-2 py-0.5">{c.kind || "claim"}</span>
              <span
                className={
                  c.status === "VERIFIED"
                    ? "rounded-full border border-success/40 bg-success/12 px-2 py-0.5 text-success"
                    : "rounded-full border border-warning/40 bg-warning/12 px-2 py-0.5 text-warning"
                }
              >
                {c.status.replace(/_/g, " ")}
              </span>
              <span>{c.sourceType.replace(/_/g, " ")}</span>
            </div>
            <p className="text-sm">{c.text}</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-60 flex-1">
                <Label className="label-caps">Source</Label>
                <Input
                  className="mt-1"
                  placeholder="Federal Reserve H.8 release, SEC 10-K, company report…"
                  value={c.source}
                  onChange={(e) =>
                    update((p) => {
                      p.claims = p.claims.map((x) =>
                        x.id === c.id ? { ...x, source: e.target.value } : x,
                      );
                      return p;
                    })
                  }
                />
              </div>
              <Button
                variant={c.status === "VERIFIED" ? "secondary" : "default"}
                onClick={() =>
                  update((p) => {
                    p.claims = p.claims.map((x) =>
                      x.id === c.id
                        ? {
                            ...x,
                            status: x.status === "VERIFIED" ? "NEEDS_SOURCE" : "VERIFIED",
                            sourceType: x.status === "VERIFIED" ? "UNVERIFIED" : "PRIMARY",
                          }
                        : x,
                    );
                    return p;
                  })
                }
              >
                {c.status === "VERIFIED" ? "Unverify" : "Mark verified"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Timeline({ project, update }: { project: Project; update: Update }) {
  const s = projectStats(project);
  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="label-caps">Silent timeline</div>
          <div className="font-display text-xl font-semibold">{fmtDuration(s.duration)}</div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
          <Music className="size-4 text-primary" />
          {project.voiceover ? project.voiceover.name : "Upload voiceover (WAV/MP3)"}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const duration = await mediaDuration(file);
              update((p) => {
                p.voiceover = { name: file.name, durationSec: duration };
                return p;
              });
              toast.success("Voiceover linked. Scene boundaries can now be tuned.");
            }}
          />
        </label>
      </div>

      {project.voiceover?.durationSec ? (
        <div className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>
            Voiceover {fmtDuration(project.voiceover.durationSec)} vs timeline {fmtDuration(s.duration)}
          </span>
          <Button
            variant="secondary"
            onClick={() =>
              update((p) => {
                const total = p.scenes.reduce((a, x) => a + x.durationSec, 0) || 1;
                const factor = (p.voiceover?.durationSec ?? total) / total;
                p.scenes = p.scenes.map((x) => ({
                  ...x,
                  durationSec: Math.max(2, Math.round(x.durationSec * factor * 10) / 10),
                }));
                return p;
              })
            }
          >
            Sync scene durations to voiceover
          </Button>
        </div>
      ) : null}

      <div className="panel space-y-1 overflow-x-auto p-3">
        {project.scenes.map((scene) => {
          const width = Math.max(4, (scene.durationSec / Math.max(1, s.duration)) * 100 * 6);
          return (
            <div key={scene.id} className="flex items-center gap-2 text-xs">
              <span className="w-10 font-mono text-muted-foreground">
                {String(scene.index).padStart(3, "0")}
              </span>
              <div
                className="h-6 min-w-16 rounded-sm border border-border bg-surface-2 px-2 leading-6"
                style={{ width: `${width}%` }}
              >
                <span className="truncate">{scene.subject}</span>
              </div>
              <input
                type="number"
                min={1}
                value={scene.durationSec}
                onChange={(e) =>
                  update((p) => {
                    p.scenes = p.scenes.map((x) =>
                      x.id === scene.id ? { ...x, durationSec: Number(e.target.value) || 1 } : x,
                    );
                    return p;
                  })
                }
                className="w-16 rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono"
              />
              <span className="text-muted-foreground">s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QualityControl({ project }: { project: Project }) {
  const issues = runQc(project);
  const errors = issues.filter((i) => i.level === "error").length;
  const ready = issues.length === 0;

  return (
    <div className="space-y-4">
      <div
        className={`panel flex flex-wrap items-center justify-between gap-3 p-5 ${
          ready ? "border-success/50" : errors ? "border-destructive/50" : "border-warning/50"
        }`}
      >
        <div className="flex items-center gap-3">
          {ready ? (
            <CheckCircle2 className="size-6 text-success" />
          ) : (
            <AlertTriangle className={`size-6 ${errors ? "text-destructive" : "text-warning"}`} />
          )}
          <div>
            <div className="font-display text-xl font-semibold">
              {ready ? "READY TO EXPORT" : "FIX REQUIRED"}
            </div>
            <div className="text-sm text-muted-foreground">
              {issues.length} checks flagged before silent export
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SilentVideoExport project={project} disabled={!!errors} />
        </div>
        <Button
          variant="secondary"
          disabled={!!errors}
          onClick={() => {
            const name = `${(project.name || "documentary").replace(/\W+/g, "_")}_Silent.json`;
            const plan = {
              project: project.name,
              aspectRatio: project.aspectRatio,
              scenes: project.scenes.map((s) => ({
                index: s.index,
                durationSec: s.durationSec,
                visualType: s.visualType,
                motionPlan: s.motionPlan,
                transition: s.transition,
                narration: s.narration,
                  assets: project.assets
                  .filter((a) => s.assetIds.includes(a.id))
                   .map((a) => ({
                     name: a.name,
                     source: a.source,
                     sourcePage: a.sourceUrl,
                     mediaUrl: a.downloadUrl || a.sourceUrl,
                   })),
              })),
            };
            const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = name;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Edit-decision plan exported for CapCut assembly.");
          }}
        >
          Export edit plan
        </Button>
      </div>

      {issues.map((i, idx) => (
        <div key={idx} className="panel flex gap-3 p-3 text-sm">
          <FileWarning
            className={`mt-0.5 size-4 shrink-0 ${i.level === "error" ? "text-destructive" : "text-warning"}`}
          />
          <div>
            <div className="font-medium">{i.title}</div>
            <div className="text-muted-foreground">{i.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SilentVideoExport({
  project,
  compact = false,
  disabled = false,
}: {
  project: Project;
  compact?: boolean;
  disabled?: boolean;
}) {
  const [rendering, setRendering] = useState(false);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState("webm");
  const abortRef = useRef<AbortController | null>(null);

  async function onRenderVideo() {
    setRendering(true);
    setPct(0);
    setPhase("Preparing selected assets…");
    setVideoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { blob, ext } = await renderSilentVideo(
        project,
        (p, label) => {
          setPct(p);
          setPhase(label);
        },
        controller.signal,
      );
      setVideoExt(ext);
      setVideoUrl(URL.createObjectURL(blob));
      toast.success("The complete silent video is ready to download.");
    } catch (e) {
      const msg = (e as Error).message;
      if (msg !== "Export cancelled.") toast.error(msg);
    } finally {
      setRendering(false);
      abortRef.current = null;
    }
  }

  const filename = `${(project.name || "documentary").replace(/\W+/g, "_")}_Full_Silent.${videoExt}`;

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "contents"}>
      {videoUrl ? (
        <Button asChild>
          <a href={videoUrl} download={filename}>
            <Download className="size-4" /> Download full video
          </a>
        </Button>
      ) : (
        <Button disabled={disabled || rendering} onClick={onRenderVideo}>
          <Clapperboard className="size-4" />
          {rendering ? "Rendering…" : compact ? "Render full video" : "Render silent video"}
        </Button>
      )}
      {rendering ? (
        <Button
          variant="secondary"
          onClick={() => {
            abortRef.current?.abort();
            toast.info("Export cancelled.");
          }}
        >
          <X className="size-4" /> Cancel
        </Button>
      ) : null}
      {!compact && rendering ? (
        <div className="w-full">
          <Progress value={pct} />
          <div className="mt-1 text-xs text-muted-foreground">
            {phase} — {pct}%. Rendering runs in real time; keep this tab visible.
          </div>
        </div>
      ) : null}
      {!compact && videoUrl ? (
        <div className="w-full text-xs text-muted-foreground">
          Rendered {videoExt.toUpperCase()} · all selected scene assets · import into CapCut for voiceover,
          music and polish. Render again after changing scenes.
        </div>
      ) : null}
    </div>
  );
}
