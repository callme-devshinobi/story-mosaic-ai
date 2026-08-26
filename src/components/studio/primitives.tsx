import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Priority, SceneStatus, VisualType } from "@/lib/types";
import { VISUAL_TYPE_LABELS } from "@/lib/types";
import { bucketOf } from "@/lib/production";

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];
  return (
    <div className="panel px-4 py-3">
      <div className="label-caps">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function TypeBadge({ type }: { type: VisualType }) {
  const bucket = bucketOf(type);
  const cls =
    bucket === "ai"
      ? "border-primary/40 bg-primary/12 text-primary"
      : bucket === "stock"
        ? "border-accent/40 bg-accent/12 text-accent"
        : "border-success/40 bg-success/12 text-success";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-display text-[10px] tracking-wide uppercase",
        cls,
      )}
    >
      {VISUAL_TYPE_LABELS[type] ?? type}
    </span>
  );
}

export function StatusBadge({ status }: { status: SceneStatus }) {
  const map: Record<SceneStatus, string> = {
    PENDING: "border-destructive/40 bg-destructive/12 text-destructive",
    UPLOADED: "border-warning/40 bg-warning/12 text-warning",
    APPROVED: "border-success/40 bg-success/12 text-success",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-display text-[10px] tracking-wide uppercase",
        map[status],
      )}
    >
      {status === "APPROVED" ? "Complete" : status.toLowerCase()}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const cls =
    priority === "HIGH" ? "bg-destructive" : priority === "MEDIUM" ? "bg-warning" : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">
      <span className={cn("size-1.5 rounded-full", cls)} />
      {priority}
    </span>
  );
}

export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
