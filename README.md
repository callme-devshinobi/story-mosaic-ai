# Script to Screen Studio

I want you to generate a web application from this work flow . 

AI DOCUMENTARY PRODUCTION WEB APP

Complete End-to-End Workflow

PROJECT PURPOSE

Build a web application that turns a long-form documentary script into a structured visual production plan, finds suitable stock assets, identifies scenes that require AI-generated visuals, gives the user optimized generation prompts, accepts uploaded AI assets, organizes everything into a timeline, and exports a finished silent video that can be taken into CapCut for final voiceover, music, sound design, and polishing.

PRIMARY USE CASE

Faceless finance/investing documentaries for a YouTube channel such as The Money Files.

TARGET VIDEO LENGTH

- Standard documentaries: 18–30 minutes

- Flagship documentaries: 45–60 minutes

CORE PRINCIPLE

The application is not initially an all-in-one AI video generator. It is an AI-powered documentary production assistant and visual assembly system. Expensive AI image/video generation can initially be performed externally with free or low-cost tools, then the generated assets are uploaded back into the application.

==================================================

1. USER STARTS A PROJECT

==================================================

User creates a new project.

Project fields:

- Project name

- Video title

- Target duration

- Aspect ratio: 16:9

- Category/niche

- Script

- Optional target audience

- Optional visual style

- Optional narration file

Example:

Project: How Banks Actually Make Money

Target duration: 25 minutes

Category: Finance

Style: Cinematic financial documentary

==================================================

2. SCRIPT INPUT

==================================================

User pastes or uploads the complete documentary script.

The AI analyzes:

- Paragraphs

- Sentences

- Topics

- People

- Companies

- Locations

- Dates

- Financial figures

- Events

- Claims

- Concepts

- Emotional moments

- Transitions

- Important visual opportunities

The AI should not merely divide the script into arbitrary chunks. It should divide the narration into meaningful visual scenes.

==================================================

3. AI SCENE SEGMENTATION

==================================================

The AI converts the script into a scene-by-scene production plan.

Each scene contains:

- Scene ID

- Start/end position in narration

- Narration text

- Estimated duration

- Main subject

- Visual objective

- Recommended visual type

- Visual priority

- Search keywords

- AI generation prompt if needed

- Whether the visual should be animated

- Suggested animation style

- Suggested camera movement

- Suggested transition

- Source/license notes

Example:

SCENE 014

Narration:

"By 2007, American households had accumulated unprecedented levels of mortgage debt."

Duration:

8 seconds

Recommended visual:

Original financial chart

Visual type:

DATA GRAPHIC

Priority:

HIGH

Reason:

The narration contains a quantitative/historical financial claim.

==================================================

4. VISUAL DIRECTOR AI

==================================================

The Visual Director AI decides what the viewer should see while hearing each section.

Possible visual categories:

1. STOCK VIDEO

2. STOCK IMAGE

3. AI IMAGE

4. AI VIDEO

5. ORIGINAL CHART

6. INFOGRAPHIC

7. MAP

8. TIMELINE

9. SCREENSHOT

10. HISTORICAL/ARCHIVAL MATERIAL

11. COMPANY DOCUMENT

12. NEWS HEADLINE

13. TEXT/MOTION GRAPHIC

14. ABSTRACT/CINEMATIC VISUAL

The AI should prioritize real-world sources when they are more appropriate and use AI-generated content where real footage is unavailable, difficult to license, or visually inferior.

==================================================

5. STOCK ASSET SEARCH

==================================================

For scenes suitable for stock content, the app searches connected stock APIs/services.

Potential sources:

- Pexels

- Pixabay

- Unsplash

- Other properly licensed stock providers

The app should return:

- Preview

- Asset type

- Source

- URL/reference

- License information when available

- Resolution

- Orientation

- Relevance score

- Visual quality score

- Recommended usage duration

The user can select an asset.

IMPORTANT:

The app must not assume that any internet image/video is free to use. Commercial-use rights and current licensing terms must be checked for each source.

==================================================

6. WHEN NO SUITABLE STOCK ASSET EXISTS

==================================================

The application identifies when a scene cannot be adequately represented by available stock assets.

It displays:

AI-GENERATED VISUAL REQUIRED

The app then determines whether the best solution is:

- AI image

- AI video

- AI image converted into video

- Original graphic

- Map

- Chart

- Timeline

Example:

SCENE 022

Narration:

"Billions of dollars were moving through an invisible global financial network."

Recommended:

AI VIDEO

Reason:

No specific real-world footage is necessary. A cinematic conceptual visualization is more effective.

==================================================

7. AI GENERATION BRIEF

==================================================

For every scene requiring external AI generation, the application creates a complete generation brief.

Each brief contains:

- Scene number

- Narration

- Asset type

- Recommended duration

- Aspect ratio

- Visual description

- Detailed generation prompt

- Camera movement

- Lens/camera style

- Lighting

- Environment

- Mood

- Composition

- Color/visual direction

- Negative prompt where supported

- Continuity instructions

- Whether the generated image should be converted into video

Example:

SCENE 027

Asset:

AI VIDEO

Duration:

7 seconds

Visual:

Cinematic financial district at night during a market crisis.

Camera:

Slow aerial push toward Wall Street.

Lighting:

Dark, overcast, realistic city lighting.

Mood:

Tension and uncertainty.

Prompt:

Create a realistic cinematic financial documentary shot of a major financial district at night during a period of market instability. Slow aerial camera movement toward the financial buildings, subtle reflections on wet streets, realistic architecture, restrained cinematic lighting, documentary realism, no text, no logos, 16:9.

==================================================

8. IMAGE-TO-VIDEO DECISION SYSTEM

==================================================

Not every AI-generated image should be converted into video.

The AI assigns one of three recommendations:

A. KEEP STATIC

Best when:

- Image itself communicates the idea

- Historical photograph

- Portrait

- Document

- Still financial concept

- Chart

- Screenshot

B. ANIMATE IN EDITOR

Use:

- Slow zoom

- Pan

- Parallax

- Motion graphics

- Text overlays

C. CONVERT TO AI VIDEO

Use when:

- Camera movement improves storytelling

- The scene benefits from environmental movement

- A cinematic establishing shot is needed

- The scene represents a concept better through motion

- The narration lasts long enough to justify movement

The system should explicitly tell the user which images should be converted into video.

==================================================

9. USER GENERATES EXTERNAL AI ASSETS

==================================================

The user takes the provided generation brief and uses a free/low-cost external AI tool.

Possible tools can include:

- Leonardo AI

- Kling

- Other currently available AI image/video generators

The user downloads the result and uploads it into the application.

The app links the uploaded asset to the correct scene.

Scene status changes:

PENDING -> UPLOADED -> APPROVED

==================================================

10. ASSET MANAGEMENT

==================================================

Every project has an asset library.

Categories:

- Stock video

- Stock image

- AI image

- AI video

- Charts

- Graphics

- Screenshots

- Documents

- Audio

- Voiceover

- Music

- SFX

Each asset has:

- Filename

- Scene ID

- Type

- Source

- License information

- Duration

- Resolution

- Status

- Notes

==================================================

11. SCENE BOARD

==================================================

The user sees the entire documentary as a visual production board.

Example:

Scene 01 | 8 sec | Wall Street footage | COMPLETE

Scene 02 | 6 sec | Bank interior | COMPLETE

Scene 03 | 7 sec | AI image | COMPLETE

Scene 04 | 8 sec | AI video required | PENDING

Scene 05 | 10 sec | Financial chart | COMPLETE

Scene 06 | 7 sec | AI image -> video | PENDING

The user should immediately see:

- Number of completed scenes

- Number of pending scenes

- Number requiring AI generation

- Number requiring stock footage

- Total estimated duration

- Missing assets

==================================================

12. ORIGINAL GRAPHICS SYSTEM

==================================================

Financial documentaries should use original charts and graphics instead of relying entirely on third-party visuals.

The application should eventually support:

- Line charts

- Bar charts

- Area charts

- Timelines

- Flow diagrams

- Money-flow diagrams

- Maps

- Comparison graphics

- Animated statistics

- Company revenue diagrams

- Market crash charts

Example:

Deposits

   ↓

Bank

   ↓

Loans

   ↓

Interest

   ↓

Revenue

   ↓

Profit

The application should ideally generate the data visualization from verified source data.

==================================================

13. PRIMARY-SOURCE MATERIAL

==================================================

For finance documentaries, the application should support attaching:

- Government reports

- Federal Reserve information

- SEC filings

- Company annual reports

- Historical market data

- Official company documents

- Court documents where appropriate

- Reputable news references

The AI should distinguish between:

- Primary source

- Secondary source

- User-provided source

- Unverified source

Important financial claims should be traceable to their sources.

==================================================

14. FACT-CHECKING LAYER

==================================================

Before final export, the application should identify:

- Financial claims

- Numerical claims

- Dates

- Names

- Company information

- Historical claims

- Statistics

Each claim should ideally have a source.

The app can display:

CLAIM:

"Company X manages $10 trillion in assets."

SOURCE:

Official company report

STATUS:

VERIFIED

The system should flag unsupported claims rather than inventing citations.

==================================================

15. VIDEO TIMELINE GENERATION

==================================================

Once all required visual assets are available, the application builds the visual timeline.

The timeline uses:

- Scene order

- Scene duration

- Narration timing if available

- Asset duration

- Recommended transitions

- Text overlays

- Graphics

- Image animation

Still images can receive:

- Ken Burns effect

- Slow zoom

- Pan

- Parallax

- Motion

- Text overlays

Video clips can be:

- Trimmed

- Cropped

- Reframed

- Positioned

- Transitioned

==================================================

16. VOICEOVER SUPPORT

==================================================

The user may upload the finished voiceover.

Preferred workflow:

- Generate narration externally using a tool such as ElevenLabs

- Upload WAV/MP3 to the project

- App analyzes duration and optionally detects scene timing

The system can synchronize:

Voiceover -> Scene 01 -> Scene 02 -> Scene 03 -> etc.

The user should be able to manually adjust scene boundaries.

==================================================

17. SILENT VIDEO EXPORT

==================================================

Initial MVP should export the completed visual documentary without requiring final narration mixing.

Output:

Money_Files_Episode_01_Silent.mp4

The user can then:

1. Download/export the video

2. Open CapCut

3. Add voiceover

4. Add music

5. Add sound effects

6. Perform final editing

7. Export final YouTube video

==================================================

18. OPTIONAL FUTURE FULL EXPORT

==================================================

Later versions can generate the final video automatically with:

- Voiceover

- Music

- SFX

- Captions

- Scene transitions

- Intro

- Outro

- Background ambience

- Loudness normalization

Output:

Money_Files_Episode_01_Final.mp4

==================================================

19. AUDIO WORKFLOW

==================================================

Recommended final workflow:

Narration:

ElevenLabs or another properly licensed voice solution

Music:

YouTube Audio Library or properly licensed music

Sound effects:

YouTube Audio Library or properly licensed SFX

Final audio mix:

CapCut initially

Future:

Built-in audio mixing system

==================================================

20. COPYRIGHT AND LICENSING

==================================================

The application should track asset origin.

For each external asset:

- Source

- URL/reference

- License type

- Commercial-use status

- Attribution requirement

- Download date

- User notes

The app should warn:

"Verify current commercial-use rights before publishing."

The application must not represent internet content as automatically copyright-free.

==================================================

21. AI DISCLOSURE SUPPORT

==================================================

If a scene uses realistic synthetic content depicting:

- Real people

- Real places

- Real events

- Events that did not actually happen

the system should flag the asset for potential YouTube altered/synthetic-content disclosure.

Example:

AI reconstruction of a historical financial event:

DISCLOSURE REVIEW REQUIRED

==================================================

22. QUALITY CONTROL

==================================================

Before export, run an automated QC check.

Check:

- Missing scenes

- Missing assets

- Incorrect aspect ratio

- Low-resolution assets

- Broken files

- Excessive repeated footage

- Audio duration mismatch

- Scene duration mismatch

- Unsupported fonts

- Text clipping

- Duplicate visuals

- Unverified financial claims

- Missing source information

- Potential licensing issues

- Potential AI disclosure requirement

Final status:

READY TO EXPORT

or

FIX REQUIRED

==================================================

23. VISUAL DIVERSITY SYSTEM

==================================================

The AI should prevent the video from becoming:

AI image -> AI image -> AI image -> AI image

It should intentionally vary visual formats.

Example target mix for a 25-minute documentary:

35–40% real/stock/archival footage

20–25% original charts/graphics/screenshots/documents

15–20% AI-generated still imagery

10–15% AI-generated video

5–10% maps/timelines/text animation/transitions

These are guidelines, not strict requirements.

Historical documentaries may require more archival material.

Conceptual finance videos may require more graphics.

==================================================

24. RECOMMENDED ASSET QUANTITY FOR A 25-MINUTE VIDEO

==================================================

Typical starting target:

AI-generated still images:

35–50

AI-generated video clips:

15–25

Stock/archival clips:

50–80

Original charts/graphics:

10–20

Screenshots/documents/headlines:

10–20

These numbers are flexible.

A single visual may be reused through:

- Cropping

- Zooming

- Panning

- Parallax

- Text overlays

- Different sections

The goal is not maximum asset count. The goal is strong visual storytelling.

==================================================

25. USER DASHBOARD

==================================================

Dashboard should show:

PROJECT:

How Banks Actually Make Money

VIDEO LENGTH:

25:18

SCENES:

42

COMPLETED:

37

PENDING:

5

AI IMAGES:

18/20 complete

AI VIDEOS:

11/15 complete

STOCK:

32/32 complete

GRAPHICS:

9/10 complete

FACT CHECK:

94% complete

LICENSE REVIEW:

2 assets need review

STATUS:

5 assets remaining

[CONTINUE PRODUCTION]

==================================================

26. MVP TECH STACK

==================================================

Frontend:

- Angular or React

Backend:

- Node.js

- Express/NestJS if desired

AI:

- LLM API for script analysis, scene planning and prompt generation

Database:

- PostgreSQL or another relational database

Storage:

- Cloud object storage

Video processing:

- FFmpeg

Stock integrations:

- Pexels API

- Pixabay API

- Other licensed providers as supported

Authentication:

- Email/password

- OAuth later

Queue/background jobs:

- Required for video processing and large asset operations

==================================================

27. MVP DEVELOPMENT ORDER

==================================================

PHASE 1

Script -> AI scene breakdown -> scene board

PHASE 2

Stock search -> select assets -> asset library

PHASE 3

AI generation briefs -> upload external AI assets

PHASE 4

Scene timeline -> automatic video assembly

PHASE 5

Voiceover upload -> synchronization

PHASE 6

Charts/graphics generation

PHASE 7

Fact-checking/source management

PHASE 8

Quality-control system

PHASE 9

Final video export

PHASE 10

Direct AI generation integrations

==================================================

28. FUTURE SAAS VERSION

==================================================

Potential product name/category:

AI Documentary Studio

Target users:

- Faceless YouTubers

- Finance channels

- History channels

- True crime channels

- Educational creators

- Documentary creators

- Video agencies

- AI content creators

Core value proposition:

"Turn your script into a complete visual production plan."

Potential future features:

- Direct AI image generation

- Direct AI video generation

- Voice generation

- Automatic subtitles

- Automatic music

- Automatic SFX

- Brand presets

- Team collaboration

- Multiple aspect ratios

- YouTube upload

- Thumbnail generation

- SEO title/description generation

- Content calendar

- Analytics integration

==================================================

29. THE MONEY FILES PRODUCTION WORKFLOW

==================================================

For each episode:

1. Research topic

2. Verify sources

3. Write original documentary script

4. Upload script to app

5. AI breaks script into scenes

6. Visual Director assigns visual requirements

7. App searches stock sources

8. User approves suitable stock assets

9. App identifies missing visuals

10. App creates AI image/video generation briefs

11. User generates missing assets externally

12. User uploads generated assets

13. App tracks every scene

14. App generates original charts/graphics

15. User uploads voiceover

16. App synchronizes timeline

17. App assembles silent documentary

18. QC checks run

19. Export silent video

20. Open CapCut

21. Add voiceover if not already synchronized

22. Add music

23. Add sound effects

24. Add final captions/text

25. Final fact-check

26. Export final video

27. Upload to YouTube

28. Optimize title, description, thumbnail and metadata

29. Monitor retention and CTR

30. Use performance data to improve the next episode

==================================================

30. CORE PRODUCT PHILOSOPHY

==================================================

The application should NOT promise:

"Press one button and AI creates a perfect documentary."

Instead, it should provide:

"AI plans the documentary. You control the creative decisions. The platform organizes, sources, tracks, assembles and prepares everything."

The goal is to combine:

- Human creative direction

- Original research

- AI assistance

- Licensed real-world footage

- AI-generated visuals

- Original data visualization

- Professional editing

into a repeatable documentary production system

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://story-mosaic-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1399cb96-cf5b-4be8-8db6-fbc9a031f1da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
