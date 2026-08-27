import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Project, Scene } from "@/lib/types";
import { PriorityDot, StatusBadge, TypeBadge } from "./primitives";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "ai", label: "Needs AI" },
  { key: "stock", label: "Needs stock" },
  { key: "disclosure", label: "Disclosure" },
] as const;

export function SceneBoard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (scene: Scene) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const scenes = project.scenes.filter((s) => {
    if (filter === "pending") return s.status !== "APPROVED";
    if (filter === "ai") return !!s.aiPrompt && s.status !== "APPROVED";
    if (filter === "stock")
      return ["STOCK_VIDEO", "STOCK_IMAGE", "ARCHIVAL"].includes(s.visualType) && s.status !== "APPROVED";
    if (filter === "disclosure") return s.disclosureReview;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "secondary"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onOpen(scene)}
            className="panel group p-3 text-left transition hover:border-primary/50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {String(scene.index).padStart(3, "0")}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{scene.durationSec}s</span>
            </div>
            <h3 className="mt-1 line-clamp-1 font-display text-sm font-semibold group-hover:text-primary">
              {scene.subject}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {scene.narration}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge type={scene.visualType} />
              <StatusBadge status={scene.status} />
              <PriorityDot priority={scene.priority} />
            </div>
            {scene.motionPlan === "CONVERT_TO_VIDEO" ? (
              <div className="mt-2 text-[10px] tracking-wide text-primary uppercase">
                Convert image → video
              </div>
            ) : null}
          </button>
        ))}
      </div>
      {!scenes.length ? (
        <div className="panel p-6 text-sm text-muted-foreground">No scenes match this filter.</div>
      ) : null}
    </div>
  );
}
