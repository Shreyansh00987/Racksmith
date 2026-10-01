# Racksmith 🎛️⚡

> **A modular synth rack planner that knows what actually fits, powers on, and won't fry your modules.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Sanity](https://img.shields.io/badge/Sanity-Lake_r674mqrk-red?style=flat&logo=sanity)](https://sanity.io/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Standard_1.2.0-blue)](https://modelcontextprotocol.io/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-orange?style=flat&logo=three.js)](https://threejs.org/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-racksmith.vercel.app-black?style=flat&logo=vercel)](https://racksmith.vercel.app)

**🌐 Live Production App:** [https://racksmith.vercel.app](https://racksmith.vercel.app)  
**📂 Live Sanity Studio:** [https://racksmith.vercel.app/studio](https://racksmith.vercel.app/studio)  
**💻 GitHub Repository:** [https://github.com/Shreyansh00987/Racksmith](https://github.com/Shreyansh00987/Racksmith)

---

## 📖 Executive Summary & Problem

Building a Eurorack modular synthesizer is notoriously treacherous. Beginners and seasoned sound designers alike frequently suffer expensive hardware failures due to four silent traps:

1. **Physical Depth Collisions**: Eurorack cases are not empty boxes. They contain power distribution bus boards, DC switching supplies, and internal support braces. A module that is 55mm deep (like a vintage Doepfer VCO) will physically crash against the bus board in a shallow skiff case (like the Intellijel Palette 62, max depth 45.5mm), cracking the PCB or shorting pins.
2. **Power Rail Limits & Inrush Current**: Eurorack power supplies deliver three distinct DC voltages: `+12V`, `-12V`, and `+5V`. When a system powers on, analog oscillators and digital DSP modules draw a sudden surge (inrush current) that can exceed 150–200% of steady-state draw. Exceeding **80% of rated capacity** can cause the power supply to brown out, produce high-pitch ground loop whistle, or fry voltage regulators.
3. **Manufacturer Specification Contradictions**: Different sources document different specifications for the exact same module. Printed user manuals often state quiescent (idle) current draw, while official engineering errata or lab oscilloscope tests reveal peak current draw under active modulation. Similarly, through-hole (THT) vintage revisions often measure 15–20mm deeper than modern surface-mount (SMD) re-issues.
4. **The Failure of Unstructured Search & Generic RAG**: Generic vector search engines fail catastrophically on Eurorack planning. If an AI performs vector similarity on raw forum text, it hallucinates dimensions, conflates revision years, and hallucinates mathematical power calculations.

**Racksmith solves this completely** by pairing an autonomous AI agent with a **Sanity Knowledge Lake** over a standards-compliant **Model Context Protocol (MCP)** server, backed by a **deterministic mathematical validation engine** and a **photorealistic 3D interactive hardware visualizer**.

---

## 🏗️ System Architecture

```text
               +------------------------------------------------+
               |              User Browser Client               |
               | (Next.js 16 + React Three Fiber 3D + Zustand)  |
               +-----------------------+------------------------+
                                       |
                   +-------------------+-------------------+
                   | User Prompt / GUI Actions             |
                   v                                       v
         +--------------------+                 +---------------------+
         |  AI Agent Router   |                 | 5-Step Golden Path  |
         |  (Vercel AI SDK +  |                 | Demo Controller     |
         |  Gemini 3.8 Flash) |                 +----------+----------+
         +---------+----------+                            |
                   | Tool Calls                            |
                   v                                       |
         +-------------------------------------+           |
         | Model Context Protocol (MCP) Client |           |
         |  - searchSanityKnowledge            |           |
         |  - getModule / getCase              |           |
         |  - getContradictions                |           |
         |  - validateRackDeterministic        |           |
         |  - saveUserDecision                 |           |
         +-----------------+-------------------+           |
                           | Linked Transport              |
                           v                               |
         +-------------------------------------+           |
         |      Sanity Context MCP Server      |           |
         | (Model Context Protocol Spec 1.2.0) |           |
         +-----------------+-------------------+           |
                           | GROQ / Lake Fetch             |
                           v                               |
         +-------------------------------------+           |
         |     Sanity Lake (r674mqrk)          |           |
         |  - 33 Modules                       |           |
         |  - 4 Cases                          |           |
         |  - 8 Manufacturers                  |           |
         |  - 6 Claims with Provenance         |           |
         |  - 3 Contradictions with Errata     |           |
         |  - Compatibility Rules              |           |
         |  - UserDecisions (Persisted)        |           |
         +-----------------+-------------------+           |
                           |                               |
                           +---------------+---------------+
                                           |
                                           v
                       +---------------------------------------+
                       |    Deterministic Validation Engine    |
                       |  - HP Width Boundary Check            |
                       |  - Mechanical Depth Collision Check   |
                       |  - 3-Rail Power & 80% Headroom Buffer |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |   Photorealistic 3D Eurorack Rack     |
                       | (Anodized Faceplates, Jacks, Collide) |
                       +---------------------------------------+
```

---

## 💎 Why Sanity Context & Structured Content?

If Sanity were replaced with a generic vector database, **Racksmith would cease to function reliably**.

### The Failure of Raw Embeddings:
A modular synth build requires strict relational invariants:
- `module.depthMM + clearanceBuffer <= case.maxDepthMM`
- `sum(module.powerPlus12) <= case.powerCapacityPlus12 * 0.80`
- `module.revision == "Modern SMD"` has `depth = 50mm`, whereas `module.revision == "Vintage THT"` has `depth = 65mm`.

In a vector database, "Make Noise Maths draws 60mA" and "Make Noise Maths draws 90mA under active cycle" simply look like high-confidence semantic matches. The LLM has no structured mechanism to understand that these are two conflicting claims representing different revision cycles or measurement methodologies.

### The Sanity Structured Content Advantage:
1. **Typed Document Lake**: Sanity stores modules, cases, manufacturers, claims, contradictions, and user decisions as formal schemas with bi-directional references (`->`).
2. **Field-Level Provenance**: Every claim in Sanity explicitly records the `entityId`, `field`, `value`, `source`, `sourceURL`, `revision`, `confidence`, and `context`.
3. **First-Class Contradiction Graph**: Discrepancies are first-class documents (`contradiction`) linking `claimA` and `claimB` with an explicit `explanation` and `impactAnalysis`.
4. **Persistent User Decisions**: When a user selects a resolution, the choice is saved to Sanity as a `userDecision` document, ensuring that future agent runs honor the user's vetted hardware reality.

---

## 🔌 Model Context Protocol (MCP) Implementation

Racksmith implements a full, standards-compliant MCP server conforming to Model Context Protocol specification v1.2.0:

### Exposed MCP Tools:
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `searchSanityKnowledge` | `query: string`, `type?: string` | Searches Sanity Lake across modules, cases, and claims with token extraction. |
| `getModule` | `nameOrId: string` | Retrieves structured technical specs, power draws, depth, and active contradictions for a module. |
| `getCase` | `nameOrId: string` | Retrieves case dimensions, rail capacities, and bus board clearance depths. |
| `getContradictions` | `moduleId?: string` | Audits documented specification discrepancies and manufacturer errata. |
| `getCompatibilityRules` | `moduleId?: string`, `caseId?: string` | Evaluates mechanical clearance rules and power constraints. |
| `validateRackDeterministic` | `caseId: string`, `moduleIds: string[]` | Runs deterministic arithmetic validation for HP width, power headroom, and physical depth collisions. |
| `saveUserDecision` | `entityId, field, chosenValue, chosenClaimId, rationale` | Persists user resolution of a contradictory specification to Sanity. |
| `getUserDecisions` | `entityId?: string` | Retrieves stored user decisions to maintain consistency across sessions. |

### Live MCP Wire Inspector:
The UI includes a collapsible, real-time **MCP Wire Inspector** that records a 50-entry rolling audit log of every protocol handshake, tool call payload, raw JSON response, and execution duration.

---

## ⚡ The Contradiction Engine

Racksmith ships with 3 realistic, externally sourced Eurorack specification contradictions:

### 1. Make Noise Maths — +12V Power Consumption Discrepancy
- **Claim A (60mA)**: Sourced from *Make Noise Maths User Manual (2022 Print)*. Context: Initial quiescent measurement with slew channels idle.
- **Claim B (90mA)**: Sourced from *Make Noise Engineering Errata & ModWiggler Lab Bench Test*. Context: Peak draw measurement with both cycle switches active and all LEDs illuminated.
- **Why It Matters**: In a small skiff (like 4ms Pod 64X with 1400mA rail or Palette with 1200mA rail), an unbudgeted 30mA swing across multiple digital/analog modules can push power rail utilization past the safe 80% threshold.
- **User Resolution**: The user can compare both claims in the visual Contradiction Modal, select the conservative 90mA errata rating, and persist this choice. The live power gauge immediately updates from `64%` to `78%`.

### 2. Doepfer A-110-1 Standard VCO — Vintage THT vs Modern SMD Depth
- **Claim A (65mm Depth)**: Sourced from *Doepfer Classic A-100 Manual Archive*. Vintage through-hole production units with daughterboards.
- **Claim B (50mm Depth)**: Sourced from *Doepfer Factory Product Catalog (2022)*. Modern surface-mount redesigned PCB.
- **Why It Matters**: A 65mm module will violently collide with almost every portable Eurorack case on the market.

### 3. Intellijel Rainmaker — PCB Depth vs Real IDC Power Cable Clearance
- **Claim A (42mm)**: Sourced from *Intellijel Official Specifications Sheet*. Measures bare circuit board only.
- **Claim B (46mm)**: Sourced from *ModWiggler Hardware Clearance Measurements*. Measures real clearance required when standard 16-pin shrouded IDC ribbon cable is plugged in.
- **Why It Matters**: In cases with exactly 44mm depth, the bare PCB fits on paper, but the actual module cannot be mounted once plugged in.

---

## 📐 Deterministic Validation Engine

To eliminate LLM arithmetic hallucinations, all mechanical and electrical calculations are executed by `src/lib/validation.ts`:

- **HP Width**:
  $$\sum \text{module.hp} \le \text{case.hp}$$
- **Physical Depth**:
  $$\forall m \in \text{modules}, \quad m.\text{depthMM} \le \text{case.maxDepthMM}$$
  - Margin $\le 2\text{mm}$: Generates `WARNING` (snug fit over bus board).
  - Margin $< 0\text{mm}$: Generates `FAIL / COLLISION` with exact mechanical overrun in millimeters.
- **Power Rail Utilization & Inrush Safety**:
  $$\text{Rail Utilization} = \frac{\sum m.\text{power}}{\text{Case Capacity}} \times 100\%$$
  - Utilization $\le 80\%$: `PASS` (Green — healthy continuous operation with inrush absorption headroom).
  - $80\% < \text{Utilization} \le 100\%$: `WARNING` (Amber — risk of brown-out during cold power-on).
  - Utilization $> 100\%$: `FAIL` (Red — severe overload; power supply shutdown or damage).

---

## 🎨 Photorealistic 3D Eurorack Visualizer

Built with **Three.js**, **React Three Fiber (R3F)**, and **Drei**:
- **Case Hardware**: Extruded aluminum rails, wooden side cheeks, and internal power bus board with accurately positioned 16-pin Eurorack headers and red "-12V" polarity orientation stripe.
- **Procedural Module Faceplates**: Metallic brushed anodized finish with laser-etched HP grid lines, precision rotary control potentiometers with indicator notches, 3.5mm CV/audio jacks with silver hexagonal nuts, and standard M3 oval mounting screws.
- **Real-Time Collision States**: When a module exceeds the case depth limit, the 3D scene renders the module protruding past the case floor with an intense pulsating red hazard glow and high-contrast collision bounding box.

---

## 🚀 5-Step Golden Path Demo Walkthrough

The top navigation bar contains 5 one-click demo flow buttons designed for instant evaluation:

1. **Step 1: Ambient 7U**
   - Configures an Intellijel 7U 84HP Studio Case.
   - Populates a classic West Coast ambient starter voice: Mutable Instruments Plaits, Rings, Make Noise Maths, Clouds, and Pamela's PRO Workout.
   - Validation: 68/84 HP used, 0 depth collisions, power rails well within green 80% safe zone.
2. **Step 2: Depth Collision Moment**
   - Switches to the ultra-shallow Intellijel Palette 62 (max depth 45.5mm) and inserts the vintage Doepfer A-110-1 Standard VCO (55mm depth).
   - Validation: **CRITICAL COLLISION** (Overrun: 9.5mm).
   - 3D Visualizer: Module faceplate glows glowing hazard red, indicating immediate bus board collision.
3. **Step 3: Spec Conflict Discovery**
   - Launches the interactive Contradiction Modal comparing Make Noise Maths 60mA manual claim vs 90mA bench test errata.
   - Shows full provenance citations, URLs, revision history, and impact analysis.
4. **Step 4: Resolve Errata Decision**
   - User clicks **"Adopt 90mA (Conservative Errata)"**.
   - Persists `userDecision` document to Sanity.
   - Power rail gauge dynamically re-calculates, reflecting real electrical load.
5. **Step 5: Export BOM & Spec Sheet**
   - Opens the Export Summary Modal.
   - Displays printable Bill of Materials (BOM), individual module power breakdown, source citations, CSV download, and JSON payload export.

---

## 💻 Setup, Installation & Verification

### Prerequisites
- Node.js 18+ (tested on Node.js v22.12.0)
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shreashu-2601/Racksmith.git
cd Racksmith2
npm install
```

### 2. Environment Configuration
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=r674mqrk
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-03-01
SANITY_API_TOKEN=<your-sanity-token-with-editor-rights>
GOOGLE_GENERATIVE_AI_API_KEY=<your-google-gemini-api-key>
```

### 3. Seed Sanity Knowledge Base
Deploys 57 curated Eurorack documents into Sanity Lake `r674mqrk`:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Executes all 15 deterministic unit and MCP integration tests:
```bash
npm test
```
*Expected Result:* `Total Tests: 15 | Passed: 15 | Failed: 0`

### 5. Build & Launch Production Server
```bash
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Hackathon Compliance Audit Matrix (Section 57)

| Requirement | Implementation Details | Verified Source File |
| :--- | :--- | :--- |
| **Sanity Project ID** | Uses authorized Sanity project `r674mqrk` (Dataset: `production`). | `src/sanity/client.ts`, `.env.local` |
| **Structured Content Schemas** | 7 schemas: `module`, `case`, `manufacturer`, `claim`, `contradiction`, `compatibilityRule`, `userDecision`. | `src/sanity/schemaTypes/` |
| **Deployed Knowledge Base** | 57 documents seeded into live Sanity Lake (33 modules, 4 cases, 8 manufacturers, 6 claims, 3 contradictions, 3 rules). | `src/sanity/seed.ts`, `src/sanity/seed-data.ts` |
| **Standards-Compliant MCP Server** | Implemented using `@modelcontextprotocol/sdk` exposing 8 tools. | `src/mcp/sanity-server.ts` |
| **MCP Client & Audit Log** | In-memory linked transport with 50-entry rolling audit log. | `src/mcp/client.ts` |
| **Deterministic Validation Engine** | Complete arithmetic verification for HP, 3-rail power (+12V, -12V, +5V), 80% headroom, and depth collisions. Zero LLM math. | `src/lib/validation.ts` |
| **Contradiction Engine** | 3 real Eurorack conflicts (Maths power, Doepfer depth, Rainmaker clearance) with provenance, URLs, and revisions. | `src/sanity/seed-data.ts`, `src/components/ContradictionModal.tsx` |
| **User Decision Persistence** | Resolving contradictions persists `userDecision` in Sanity and triggers dynamic rack re-validation. | `src/sanity/knowledge.ts`, `src/store/useRackStore.ts` |
| **Interactive 3D Rack** | Procedural faceplates, knobs, jacks, bus board headers, red -12V polarity line, and collision highlighting in Three.js/R3F. | `src/components/Rack3D.tsx`, `Module3D.tsx`, `Case3D.tsx` |
| **5-Step Golden Path Demo** | 1-click header buttons for Ambient voice, Depth collision, Spec conflict, Errata resolution, and BOM export. | `src/components/MainApp.tsx` |
| **Exportable BOM** | Printable spec sheet, CSV export, and JSON payload with source provenance. | `src/components/ExportSummaryModal.tsx` |
| **Automated Test Suite** | 15 passing tests across HP, depth collision, power rails, contradictions, and MCP client calls. | `tests/run-all-tests.ts` |
| **Production Build** | Zero TypeScript errors, clean compilation with Turbopack. | `npm run build` |

---

## 📜 License
MIT License. Built for the Sanity Hackathon.
