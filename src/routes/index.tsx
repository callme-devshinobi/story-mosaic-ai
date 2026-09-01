import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  Check,
  Clapperboard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Library,
  ListVideo,
  Menu,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject, deleteProject, useProject, useProjects } from "@/lib/store";
import { analyzeScript } from "@/lib/ai.functions";
import { uid } from "@/lib/store";
import { Dashboard, AssetLibrary, FactCheck, QualityControl, Timeline } from "@/components/studio/Panels";
import { SceneBoard } from "@/components/studio/SceneBoard";
import { SceneDetail } from "@/components/studio/SceneDetail";
import type { Claim, Project, Scene, VisualType } from "@/lib/types";
import { AI_TYPES, GRAPHIC_TYPES, STOCK_TYPES } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Documentary Studio — Visual production planning" },
      {
        name: "description",
        content: "Turn a documentary script into a visual production plan with scenes, stock research, AI briefs and asset tracking.",
      },
      { property: "og:title", content: "Documentary Studio — Visual production planning" },
      { property: "og:description", content: "AI plans the documentary. You control the creative decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type View = "overview" | "scenes" | "assets" | "timeline" | "factcheck" | "qc";

const demoScript = `By 2007, American households had accumulated unprecedented levels of mortgage debt. For years, the system appeared stable. Banks packaged those loans into securities and sold them around the world. But beneath the surface, billions of dollars were moving through an invisible financial network. When the housing market turned, the entire machine began to unwind. The crisis was not a single event. It was a chain reaction built on leverage, optimism, and a story that everyone wanted to believe.`;

function App() {
  const projects = useProjects();
  const [activeId, setActiveId] = useState<string | null>(projects[0]?.id ?? null);
  const active = projects.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId && projects[0]) setActiveId(projects[0].id);
  }, [activeId, projects]);

  if (!active) return <ProjectLauncher onCreated={setActiveId} />;
  return <Studio projectId={active.id} projects={projects} onSelect={setActiveId} />;
}

function ProjectLauncher({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("25");
  const [category, setCategory] = useState("Finance");
  const [style, setStyle] = useState("Cinematic financial documentary");
  const [audience, setAudience] = useState("");
  const [script, setScript] = useState("");

  const submit = () => {
    if (!name.trim()) return toast.error("Name the project first.");
    const p = createProject({
      name,
      videoTitle: title || name,
      targetMinutes: Number(target) || 25,
      category,
      style,
      audience,
      script,
    });
    onCreated(p.id);
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <Brand />
          <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Local workspace
          </span>
        </header>
        <section className="max-w-3xl py-8 sm:py-16">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <span className="h-px w-10 bg-primary" />
            <span className="label-caps text-primary">The Money Files production system</span>
          </div>
          <h1 className="max-w-3xl text-5xl leading-[0.98] font-semibold sm:text-7xl">
            From script to <span className="text-primary">storyboard.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            AI plans the documentary. You control the creative decisions. Build scenes, source licensed visuals, brief missing assets, and keep every claim traceable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setOpen(true)}>
              <Plus /> New project
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const p = createProject({
                  name: "How Banks Actually Make Money",
                  videoTitle: "How Banks Actually Make Money",
                  targetMinutes: 25,
                  category: "Finance",
                  style: "Cinematic financial documentary",
                  script: demoScript,
                });
                onCreated(p.id);
              }}
            >
              <Clapperboard /> Try demo project
            </Button>
          </div>
        </section>
        <div className="grid max-w-4xl gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[['01', 'Meaningful scenes', 'Break narration by visual idea, not arbitrary chunks.'], ['02', 'Visual direction', 'Know when to source, draw, animate or generate.'], ['03', 'Production control', 'Track assets, claims, licensing and readiness.']].map(([num, title, copy]) => (
            <div key={num} className="bg-surface p-5">
              <div className="font-mono text-xs text-primary">{num}</div>
              <div className="mt-8 font-display font-semibold">{title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>
      {open ? (
        <ProjectForm
          name={name}
          title={title}
          target={target}
          category={category}
          style={style}
          audience={audience}
          script={script}
          setName={setName}
          setTitle={setTitle}
          setTarget={setTarget}
          setCategory={setCategory}
          setStyle={setStyle}
          setAudience={setAudience}
          setScript={setScript}
          onCancel={() => setOpen(false)}
          onSubmit={submit}
        />
      ) : null}
    </main>
  );
}

function ProjectForm({
  name, title, target, category, style, audience, script,
  setName, setTitle, setTarget, setCategory, setStyle, setAudience, setScript,
  onCancel, onSubmit,
}: { name: string; title: string; target: string; category: string; style: string; audience: string; script: string; setName: (v: string) => void; setTitle: (v: string) => void; setTarget: (v: string) => void; setCategory: (v: string) => void; setStyle: (v: string) => void; setAudience: (v: string) => void; setScript: (v: string) => void; onCancel: () => void; onSubmit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-sm sm:p-10">
      <div className="panel w-full max-w-3xl p-5 sm:p-7">
        <div className="flex items-start justify-between">
          <div><div className="label-caps text-primary">New production</div><h2 className="mt-1 text-2xl font-semibold">Start a documentary</h2></div>
          <Button size="icon" variant="ghost" onClick={onCancel}><X /></Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Project name" value={name} onChange={setName} placeholder="How Banks Actually Make Money" />
          <Field label="Video title" value={title} onChange={setTitle} placeholder="Public-facing title" />
          <Field label="Target duration (minutes)" value={target} onChange={setTarget} type="number" />
          <Field label="Category / niche" value={category} onChange={setCategory} placeholder="Finance" />
          <Field label="Visual style" value={style} onChange={setStyle} placeholder="Cinematic financial documentary" />
          <Field label="Target audience (optional)" value={audience} onChange={setAudience} placeholder="Curious retail investors" />
        </div>
        <div className="mt-4"><Label className="label-caps">Documentary script</Label><Textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Paste the complete narration here…" className="mt-1 min-h-48" /></div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button onClick={onSubmit}><ArrowLeft className="rotate-180" /> Create project</Button></div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <div><Label className="label-caps">{label}</Label><Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1" /></div>;
}

function Brand() {
  return <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Clapperboard className="size-5" /></div><div><div className="font-display text-sm font-bold tracking-wide">DOCUMENTARY</div><div className="label-caps text-[9px]">Studio</div></div></div>;
}

function Studio({ projectId, projects, onSelect }: { projectId: string; projects: Project[]; onSelect: (id: string) => void }) {
  const { project, loaded, update } = useProject(projectId);
  const [view, setView] = useState<View>("overview");
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  if (!loaded || !project) return null;

  const runAnalysis = async () => {
    if (project.script.trim().length < 40) return toast.error("Add a script of at least 40 characters first.");
    setAnalyzing(true);
    try {
      const result = await analyzeScript({ data: {
        script: project.script,
        title: project.videoTitle,
        category: project.category,
        style: project.style,
        audience: project.audience,
        targetMinutes: project.targetMinutes,
        aspectRatio: project.aspectRatio,
      } });
      const scenes = result.scenes.map((raw, i) => normalizeScene(raw, i));
      const claims: Claim[] = (result.claims ?? []).map((c, i) => ({
        id: uid('claim'), text: String(c.text || ''), kind: String(c.kind || 'claim'), sceneId: scenes[Math.max(0, Number(c.sceneIndex || 1) - 1)]?.id ?? null,
        sourceType: ['PRIMARY', 'SECONDARY', 'USER_PROVIDED', 'UNVERIFIED'].includes(String(c.sourceType)) ? String(c.sourceType) as Claim['sourceType'] : 'UNVERIFIED',
        source: String(c.source || ''), status: ['VERIFIED', 'NEEDS_SOURCE', 'FLAGGED'].includes(String(c.status)) ? String(c.status) as Claim['status'] : 'NEEDS_SOURCE',
      }));
      update((p) => { p.scenes = scenes; p.claims = claims; p.assets = []; return p; });
      setView('scenes');
      toast.success(`${scenes.length} meaningful scenes planned.`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-7">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileNav(!mobileNav)}><Menu /></Button>
          <Brand />
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{project.name}</div><div className="font-mono text-[10px] text-muted-foreground">{project.category} · {project.aspectRatio} · local workspace</div></div>
          <Button variant="secondary" onClick={runAnalysis} disabled={analyzing || project.script.length < 40}>{analyzing ? <Sparkles className="animate-pulse" /> : <Sparkles />} {analyzing ? 'Analyzing…' : 'Analyze script'}</Button>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`${mobileNav ? 'fixed inset-y-16 left-0 z-20 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-border bg-sidebar p-3 lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)]`}>
          <div className="label-caps mb-2 px-3">Production</div>
          <NavItem icon={<LayoutDashboard />} label="Overview" active={view === 'overview'} onClick={() => { setView('overview'); setMobileNav(false); }} />
          <NavItem icon={<ListVideo />} label="Scene board" active={view === 'scenes'} count={project.scenes.length || undefined} onClick={() => { setView('scenes'); setMobileNav(false); }} />
          <NavItem icon={<Library />} label="Asset library" active={view === 'assets'} count={project.assets.length || undefined} onClick={() => { setView('assets'); setMobileNav(false); }} />
          <NavItem icon={<BarChart3 />} label="Timeline" active={view === 'timeline'} onClick={() => { setView('timeline'); setMobileNav(false); }} />
          <div className="label-caps mb-2 mt-7 px-3">Review</div>
          <NavItem icon={<BookOpenCheck />} label="Fact check" active={view === 'factcheck'} count={project.claims.filter(c => c.status !== 'VERIFIED').length || undefined} onClick={() => { setView('factcheck'); setMobileNav(false); }} />
          <NavItem icon={<Check />} label="Quality control" active={view === 'qc'} onClick={() => { setView('qc'); setMobileNav(false); }} />
          <div className="mt-auto border-t border-border pt-3">
            {projects.length > 1 ? projects.filter((p) => p.id !== project.id).map((p) => <NavItem key={p.id} icon={<FolderOpen />} label={`Open ${p.name}`} onClick={() => { onSelect(p.id); setMobileNav(false); }} />) : null}
            <NavItem icon={<Plus />} label="New project" onClick={() => { setMobileNav(false); toast.info("Use the browser back button to start another local project."); }} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="label-caps text-primary">{view === 'overview' ? 'Production desk' : view.replace('factcheck', 'fact check')}</div><h1 className="mt-1 text-3xl font-semibold capitalize sm:text-4xl">{view === 'overview' ? project.videoTitle || project.name : view === 'scenes' ? 'Scene board' : view === 'assets' ? 'Asset library' : view === 'timeline' ? 'Visual timeline' : view === 'factcheck' ? 'Fact check' : 'Quality control'}</h1></div>{view === 'scenes' ? <span className="font-mono text-xs text-muted-foreground">Click a scene to direct the visual</span> : null}</div>
            {view === 'overview' ? <Dashboard project={project} /> : null}
            {view === 'scenes' ? <SceneBoard project={project} onOpen={setSelectedScene} /> : null}
            {view === 'assets' ? <AssetLibrary project={project} update={update} /> : null}
            {view === 'timeline' ? <Timeline project={project} update={update} /> : null}
            {view === 'factcheck' ? <FactCheck project={project} update={update} /> : null}
            {view === 'qc' ? <QualityControl project={project} /> : null}
            {!project.scenes.length && view !== 'overview' ? <div className="panel mt-4 flex flex-col items-start gap-4 p-6"><FileText className="size-5 text-primary" /><div><div className="font-display font-semibold">Your visual plan starts with the script</div><p className="mt-1 text-sm text-muted-foreground">Add or edit the script in project settings, then run Analyze script.</p></div><Button onClick={runAnalysis} disabled={project.script.length < 40}><Sparkles /> Analyze now</Button></div> : null}
          </div>
        </main>
      </div>
      <SceneDetail project={project} scene={selectedScene ? project.scenes.find(s => s.id === selectedScene.id) ?? null : null} onClose={() => setSelectedScene(null)} update={update} />
    </div>
  );
}

function NavItem({ icon, label, count, active, onClick }: { icon: React.ReactNode; label: string; count?: number; active?: boolean; onClick: () => void }) {
  return <Button variant={active ? 'secondary' : 'ghost'} className="mb-1 w-full justify-start gap-3" onClick={onClick}>{icon}<span className="flex-1 text-left">{label}</span>{count ? <span className="font-mono text-[10px] text-muted-foreground">{count}</span> : null}</Button>;
}

function normalizeScene(raw: Record<string, unknown>, index: number): Scene {
  const validTypes = [...AI_TYPES, ...STOCK_TYPES, ...GRAPHIC_TYPES, 'ABSTRACT_CINEMATIC'] as string[];
  const visualType = validTypes.includes(String(raw.visualType)) ? String(raw.visualType) as VisualType : 'STOCK_VIDEO';
  const validMotion = ['KEEP_STATIC', 'ANIMATE_IN_EDITOR', 'CONVERT_TO_VIDEO'];
  const validPriority = ['HIGH', 'MEDIUM', 'LOW'];
  return {
    id: uid('scene'), index: index + 1, narration: String(raw.narration || ''), durationSec: Math.max(1, Number(raw.durationSec) || 8), subject: String(raw.subject || `Scene ${index + 1}`), objective: String(raw.objective || ''), visualType,
    priority: validPriority.includes(String(raw.priority)) ? String(raw.priority) as Scene['priority'] : 'MEDIUM', reason: String(raw.reason || ''), keywords: Array.isArray(raw.keywords) ? raw.keywords.map(String) : [], needsAi: AI_TYPES.includes(visualType), motionPlan: validMotion.includes(String(raw.motionPlan)) ? String(raw.motionPlan) as Scene['motionPlan'] : 'ANIMATE_IN_EDITOR', motionReason: String(raw.motionReason || ''), animationStyle: String(raw.animationStyle || ''), camera: String(raw.camera || ''), lighting: String(raw.lighting || ''), mood: String(raw.mood || ''), composition: String(raw.composition || ''), colorDirection: String(raw.colorDirection || ''), transition: String(raw.transition || ''), aiPrompt: String(raw.aiPrompt || ''), negativePrompt: String(raw.negativePrompt || ''), continuity: String(raw.continuity || ''), licenseNotes: String(raw.licenseNotes || 'Verify current commercial-use rights before publishing.'), disclosureReview: Boolean(raw.disclosureReview), status: 'PENDING', assetIds: [],
  };
}
