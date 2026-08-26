import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  script: z.string().min(40),
  title: z.string().default(""),
  category: z.string().default("Finance"),
  style: z.string().default("Cinematic financial documentary"),
  audience: z.string().default(""),
  targetMinutes: z.number().min(1).max(120).default(25),
  aspectRatio: z.string().default("16:9"),
});

const SYSTEM = `You are the Visual Director of a faceless finance/investing documentary channel.
You convert a narration script into a scene-by-scene visual production plan.

Rules:
- Segment by MEANING, not arbitrary chunks. Each scene = one clear visual idea, usually 5-12 seconds of narration (about 2.5 narrated words per second).
- Cover the WHOLE script in order. Narration text of scenes concatenated must reconstruct the script.
- Deliberately vary visual formats. Target mix roughly: 35-40% stock/archival footage, 20-25% original charts/graphics/screenshots/documents, 15-20% AI still images, 10-15% AI video, 5-10% maps/timelines/text animation. Never chain more than two AI visuals in a row.
- Quantitative, historical or comparative claims must become ORIGINAL_CHART, INFOGRAPHIC, TIMELINE, MAP, NEWS_HEADLINE, SCREENSHOT or COMPANY_DOCUMENT.
- Use AI visuals only when real footage is unavailable, hard to license, or visually inferior.
- motionPlan: KEEP_STATIC (image alone communicates: portrait, document, chart), ANIMATE_IN_EDITOR (slow zoom/pan/parallax/text), CONVERT_TO_VIDEO (camera or environmental motion genuinely improves storytelling and the narration is long enough).
- aiPrompt is only for scenes whose visualType is AI_IMAGE, AI_VIDEO or ABSTRACT_CINEMATIC: write a full production-ready prompt (subject, environment, camera move, lens, lighting, mood, composition, colour, "documentary realism, no text, no logos", aspect ratio).
- disclosureReview = true when a synthetic visual realistically depicts real people, real places, real events, or a reconstruction of events that did not happen exactly that way.
- claims: extract every financial figure, statistic, date, named company/person and historical assertion. Never invent citations; unsourced claims get sourceType UNVERIFIED and status NEEDS_SOURCE.
- licenseNotes: short reminder of what must be verified for that visual type.

Return ONLY JSON matching:
{"scenes":[{"narration":"","durationSec":8,"subject":"","objective":"","visualType":"STOCK_VIDEO","priority":"HIGH","reason":"","keywords":[""],"motionPlan":"ANIMATE_IN_EDITOR","motionReason":"","animationStyle":"","camera":"","lighting":"","mood":"","composition":"","colorDirection":"","transition":"","aiPrompt":"","negativePrompt":"","continuity":"","licenseNotes":"","disclosureReview":false}],
"claims":[{"text":"","kind":"","sceneIndex":1,"sourceType":"UNVERIFIED","status":"NEEDS_SOURCE","source":""}]}
visualType is one of STOCK_VIDEO, STOCK_IMAGE, AI_IMAGE, AI_VIDEO, ORIGINAL_CHART, INFOGRAPHIC, MAP, TIMELINE, SCREENSHOT, ARCHIVAL, COMPANY_DOCUMENT, NEWS_HEADLINE, MOTION_GRAPHIC, ABSTRACT_CINEMATIC.`;

export const analyzeScript = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const user = `DOCUMENTARY: ${data.title || "(untitled)"}
CATEGORY: ${data.category}
VISUAL STYLE: ${data.style}
AUDIENCE: ${data.audience || "general retail investors"}
TARGET LENGTH: ${data.targetMinutes} minutes
ASPECT RATIO: ${data.aspectRatio}

SCRIPT:
"""
${data.script}
"""`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        stream: true,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      if (res.status === 402)
        throw new Error("AI credits are exhausted for this workspace. Add credits to continue.");
      if (res.status === 429)
        throw new Error("AI is rate limited right now. Wait a moment and try again.");
      throw new Error(`AI request failed (${res.status}). ${body.slice(0, 300)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          text += json.choices?.[0]?.delta?.content ?? "";
        } catch {
          /* partial frame */
        }
      }
    }

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI returned an unreadable plan. Try again.");
    return JSON.parse(text.slice(start, end + 1)) as {
      scenes: Record<string, unknown>[];
      claims?: Record<string, unknown>[];
    };
  });
