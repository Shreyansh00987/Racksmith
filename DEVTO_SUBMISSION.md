# Racksmith: The Autonomous Modular Synth Planner Powered by Sanity Context MCP

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

---

## ⚡ Quick Links & Production Deployments

* 🚀 **Live Production Application:** [https://racksmith.vercel.app](https://racksmith.vercel.app)
* 📂 **Live Sanity CMS Studio:** [https://racksmith.vercel.app/studio](https://racksmith.vercel.app/studio)
* 💻 **GitHub Repository:** [https://github.com/Shreyansh00987/Racksmith](https://github.com/Shreyansh00987/Racksmith)
* 🎥 **YouTube Walkthrough Video:** [https://youtu.be/6P5E7SOY9S0](https://youtu.be/6P5E7SOY9S0)
* 🏷️ **Sanity Project ID:** `r674mqrk` (Dataset: `production`)

---

## What I Built

Building a Eurorack modular synthesizer is notoriously treacherous. Beginners and professional sound designers alike routinely damage expensive hardware due to four silent traps:

1. **Physical Depth Collisions**: Eurorack cases are not empty boxes. They contain power distribution bus boards, DC switching supplies, and internal support rails. A module that is 55mm deep (such as a vintage Doepfer A-110-1 VCO) will physically crash against the bus board in a shallow skiff case (such as the Intellijel Palette 62, max clearance 45.5mm), cracking the PCB or shorting pins.
2. **Power Rail Blowouts & Inrush Current**: Eurorack power supplies deliver three distinct DC voltage rails: `+12V`, `-12V`, and `+5V`. When powering on, analog oscillators and digital DSP modules draw an inrush surge exceeding 150–200% of steady-state draw. Exceeding **80% of rated rail capacity** causes power supplies to brown out, produce high-pitched ground whistle, or fry voltage regulators.
3. **Manufacturer Specification Contradictions**: Different sources document conflicting specifications for the exact same module. Printed manuals often cite quiescent (idle) current draw, while official engineering errata or lab oscilloscope tests reveal peak current under heavy modulation. Similarly, through-hole (THT) vintage revisions often measure 15–20mm deeper than modern surface-mount (SMD) re-issues.
4. **The Catastrophic Failure of Unstructured Vector RAG**: Standard vector embeddings fail on Eurorack planning. If an LLM performs cosine similarity over raw forum threads or PDF scrapes, it conflates revision years, hallucinates dimensions, and fails elementary arithmetic on multi-rail power sums.

### The Solution: Racksmith
**Racksmith** solves this by pairing an autonomous AI agent (powered by the Vercel AI SDK and Gemini 3.8 Flash) with a **Sanity Knowledge Lake** via a standards-compliant **Model Context Protocol (MCP)** server. The agent queries structured documents with field-level provenance, evaluates safety through a **deterministic mathematical validation engine**, surfaces real-world manufacturer errata in an interactive resolution modal, and renders the result in a **photorealistic 3D interactive hardware visualizer**.

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

## Demo

{% embed https://youtu.be/6P5E7SOY9S0 %}

* **Live Interactive Application:** [https://racksmith.vercel.app](https://racksmith.vercel.app)
* **Embedded Sanity Studio:** [https://racksmith.vercel.app/studio](https://racksmith.vercel.app/studio)

---

### 🧪 Complete Walkthrough — Example 1: The 5-Step Golden Flow

In this end-to-end demonstration, we explore how Racksmith detects physical hardware collisions and handles manufacturer errata:

#### 1. Initial Dashboard & 3D Hardware Canvas
When opening Racksmith, users are greeted by the interactive 3D Eurorack canvas, active power consumption meters, and the Sanity Knowledge Lake inventory.

![Step 1 - Initial Page](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/01_initial_page.png)

#### 2. Loading the Ambient 7U Performance Rack
Loading the curated Ambient 7U preset populates an Intellijel 7U 104HP case with complex modules (Morphagene, Rings, Beads, Maths). The mathematical engine confirms all modules fit within the 104HP limit and remain within the 80% power budget.

![Step 2 - Ambient 7U Rack](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/02_ambient_7u.png)

#### 3. Real-Time Depth Collision Detection
Switching to a shallow skiff (**Intellijel Palette 62**, max depth 45.5mm) while mounting a **Doepfer A-110-1 Standard VCO** (depth 55mm) triggers an immediate physical collision alert. The system flags that the module will physically impact the case bus board.

![Step 3 - Depth Collision Alert](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/03_depth_collision.png)

#### 4. Specification Contradiction & Manufacturer Errata
Clicking on Make Noise Maths opens the **Spec Conflict Resolution Modal**. Sanity retrieves two conflicting claims from its Knowledge Lake:
- **Claim A (Printed Manual):** 60mA @ +12V (Quiescent idle state).
- **Claim B (Engineering Bench Errata):** 90mA @ +12V under active high-frequency modulation.
- **Physical Depth:** Vintage Through-Hole (45mm) vs Modern Surface-Mount (25mm).

![Step 4 - Spec Conflict Modal](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/04_spec_conflict_modal.png)

#### 5. Errata Resolution Persisted to Sanity Lake
The user selects the **Modern SMD Revision (25mm depth / 90mA active draw)**. The selection is sent to the Sanity MCP server and saved as a persistent `userDecision` document. The depth collision warning immediately clears.

![Step 5 - Errata Resolved](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/05_errata_resolved.png)

#### 6. Verified Bill of Materials (BOM) Export
Once all rules pass, the user exports a verified Bill of Materials with complete HP layout, depth safety margins, 3-rail current calculations, and direct manufacturer links.

![Step 6 - Export BOM Modal](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/06_export_bom_modal.png)

---

### 🤖 Complete Walkthrough — Example 2: Autonomous AI Agent via MCP

In this second demonstration, the AI Agent plans a modular synth system autonomously using natural language:

#### 1. AI Agent Standby State
The user navigates to the **AI Agent** tab. The agent is initialized with direct tool bindings to the Sanity Context MCP server.

![Agent Step 1 - Ready State](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/agent_01_ready.png)

#### 2. Natural Language Prompt
The user enters a complex hardware request:
> *"Build an ambient sound design rack with complex modulation and reverb, make sure modules fit in depth and don't exceed power limits."*

![Agent Step 2 - Prompt Typed](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/agent_02_prompt_typed.png)

#### 3. Agent Execution & Sanity MCP Tool Calling
The agent executes tool calls against the Sanity MCP Server:
- `searchSanityKnowledge`: Queries Sanity for ambient sound sources and filters.
- `getModule`: Retrieves exact dimensions and multi-rail power draws.
- `validateRackDeterministic`: Passes candidate configurations through the mathematical engine, automatically rejecting modules that exceed case depth or violate the 80% power headroom ceiling.

![Agent Step 3 - MCP Execution](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/agent_03_mcp_response.png)

#### 4. Autonomous 3D Rack Population
The agent presents its verified reasoning, citing the exact GROQ documents retrieved from Sanity, and directly mounts the optimal modules (Plaits, Rings, Beads, Maths SMD) onto the 3D hardware rack without human intervention.

![Agent Step 4 - Rack Built](https://raw.githubusercontent.com/Shreyansh00987/Racksmith/main/screenshots/agent_04_rack_built.png)

---

## Code

The complete source code is public and open source on GitHub:

[![GitHub Repository](https://img.shields.io/badge/GitHub-Shreyansh00987%2FRacksmith-blue?style=for-the-badge&logo=github)](https://github.com/Shreyansh00987/Racksmith)

👉 **[https://github.com/Shreyansh00987/Racksmith](https://github.com/Shreyansh00987/Racksmith)**

### Tech Stack:
- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Content & Knowledge Lake:** Sanity Lake (`r674mqrk`, dataset `production`)
- **Protocol:** Model Context Protocol (MCP Standard Spec 1.2.0)
- **AI Engine:** Vercel AI SDK (`ai/rsc`) + Google Gemini 3.8 Flash
- **3D Visualization:** React Three Fiber + Three.js + Drei
- **State Management:** Zustand
- **Deployment:** Vercel

---

## How I Used Sanity

### Why Structured Content Beats Unstructured Vector RAG

If Sanity were replaced with a generic vector database, **Racksmith would fail**.

A modular synthesizer build requires strict relational invariants:
- `module.depthMM + clearanceBuffer <= case.maxDepthMM`
- `sum(module.powerPlus12) <= case.powerCapacityPlus12 * 0.80`

In an unstructured vector store, a search for *"Make Noise Maths power draw"* returns chunk embeddings where *"Draws 60mA"* and *"Draws 90mA under active cycle"* look like identical high-confidence semantic matches. An LLM has no mechanism to determine which claim corresponds to which revision or test methodology.

With Sanity, specifications are stored as **typed, structured entities with field-level provenance**.

### Structured Schemas in Sanity:

1. **`module`**: Encapsulates width (`hp`), mechanical depth (`depthMM`), 3-rail current (`powerPlus12`, `powerMinus12`, `powerPlus5`), category, and manufacturer reference.
2. **`case`**: Defines total HP, row count, depth clearance (`maxDepthMM`), and power supply ratings (`powerPlus12`, `powerMinus12`, `powerPlus5`).
3. **`manufacturer`**: Authoritative maker profile with website and technical support links.
4. **`claim`**: Represents a specific technical assertion (`field`, `value`, `unit`, `sourceURL`, `revision`, `confidence`).
5. **`contradiction`**: First-class document linking conflicting claims (`claimA` <-> `claimB`) with `explanation`, `conflictType`, and `impactAnalysis`.
6. **`userDecision`**: Records the user's resolution back into the Sanity dataset so that future AI agent invocations honor the user's vetted hardware reality.

### MCP Tools Built on Sanity Context:

The Next.js application exposes an MCP server (`/api/mcp`) implementing 5 core tools:

```typescript
// Example: Sanity MCP Tool for Discrepancy & Errata Retrieval
server.tool(
  'getContradictions',
  'Retrieve known specification contradictions and manufacturer errata',
  { moduleId: z.string().optional() },
  async ({ moduleId }) => {
    const query = moduleId
      ? `*[_type == "contradiction" && (claimA->module._ref == $moduleId || claimB->module._ref == $moduleId)]{
          _id, title, explanation, impactAnalysis,
          claimA->{ field, value, unit, source, revision },
          claimB->{ field, value, unit, source, revision }
        }`
      : `*[_type == "contradiction"]{
          _id, title, explanation, impactAnalysis,
          claimA->{ field, value, unit, source, revision },
          claimB->{ field, value, unit, source, revision }
        }`;
    const result = await sanityClient.fetch(query, { moduleId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);
```

### Deterministic Validation Engine
The agent does not guess math. When an agent wants to evaluate a rack configuration, it calls the `validateRackDeterministic` MCP tool:

```typescript
export function validateRack(modules: Module[], targetCase: Case): ValidationResult {
  const totalHp = modules.reduce((acc, m) => acc + m.hp, 0);
  const hpOverflow = totalHp > targetCase.totalHp;

  const depthCollisions = modules
    .filter(m => m.depthMM > targetCase.maxDepthMM)
    .map(m => ({ module: m.name, moduleDepth: m.depthMM, maxDepth: targetCase.maxDepthMM }));

  const currentPlus12 = modules.reduce((acc, m) => acc + m.powerPlus12, 0);
  const maxPlus12Safe = targetCase.powerCapacityPlus12 * 0.80;
  const power12Overload = currentPlus12 > maxPlus12Safe;

  return {
    isValid: !hpOverflow && depthCollisions.length === 0 && !power12Overload,
    metrics: { totalHp, currentPlus12, maxPlus12Safe },
    depthCollisions,
    hpOverflow,
    power12Overload
  };
}
```

---

## Sanity Project Details

* **Sanity Project ID:** `r674mqrk`
* **Dataset:** `production`
* **Live Embedded Studio:** [https://racksmith.vercel.app/studio](https://racksmith.vercel.app/studio)
* **CORS Origins Configured:** `https://racksmith.vercel.app`, `http://localhost:3000`
* **Public Dataset Query Endpoint:**
  ```text
  https://r674mqrk.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="module"][0...5]{name,hp,depthMM,powerPlus12}
  ```

---

## Agent Session

Below is a curated transcript excerpt demonstrating how the agent invokes Sanity MCP tools to safely resolve an ambiguous hardware request:

```json
[
  {
    "role": "user",
    "content": "Build an ambient sound design rack with complex modulation and reverb, make sure modules fit in depth and don't exceed power limits."
  },
  {
    "role": "assistant",
    "thought": "The user wants an ambient rack. I must query Sanity Knowledge Lake for modules tagged with 'ambient', 'reverb', or 'modulation'. I will check their depths against standard case clearances.",
    "tool_call": {
      "name": "searchSanityKnowledge",
      "arguments": { "query": "ambient modulation reverb granular" }
    }
  },
  {
    "role": "tool",
    "name": "searchSanityKnowledge",
    "content": [
      { "name": "Mutable Instruments Beads", "category": "granular", "hp": 14, "depthMM": 25, "powerPlus12": 100 },
      { "name": "Mutable Instruments Rings", "category": "resonator", "hp": 14, "depthMM": 25, "powerPlus12": 120 },
      { "name": "Make Noise Maths", "category": "modulation", "hp": 20, "depthMM": 25, "powerPlus12": 90 }
    ]
  },
  {
    "role": "assistant",
    "thought": "I will check for known contradictions on Make Noise Maths before adding it.",
    "tool_call": {
      "name": "getContradictions",
      "arguments": { "moduleId": "module-make-noise-maths" }
    }
  },
  {
    "role": "tool",
    "name": "getContradictions",
    "content": [
      {
        "title": "Make Noise Maths Power & Depth Errata",
        "explanation": "Vintage THT units draw 60mA quiescent and measure 45mm deep. Modern SMD units draw up to 90mA active cycle and measure 25mm deep.",
        "impactAnalysis": "Vintage revision will collide with shallow skiff cases (Palette 62)."
      }
    ]
  },
  {
    "role": "assistant",
    "thought": "Selecting the Modern SMD revision guarantees 25mm depth, safely fitting within the 45.5mm skiff limit. Now validating total power.",
    "tool_call": {
      "name": "validateRackDeterministic",
      "arguments": {
        "caseId": "case-palette-62",
        "moduleIds": ["module-plaits", "module-rings", "module-beads", "module-maths-smd"]
      }
    }
  },
  {
    "role": "tool",
    "name": "validateRackDeterministic",
    "content": {
      "isValid": true,
      "totalHp": 60,
      "maxHp": 62,
      "powerPlus12": 360,
      "maxPowerPlus12Allowed": 960,
      "depthCollision": null
    }
  },
  {
    "role": "assistant",
    "content": "I have assembled an ambient sound design rack for you! I verified through the Sanity Knowledge Lake that Make Noise Maths has a known errata between vintage THT (45mm) and modern SMD (25mm). By selecting the modern SMD revision, all 4 modules (Plaits, Rings, Beads, and Maths) safely fit into your 62HP case with 0 depth collisions and consume only 360mA on the +12V rail (well below your 80% safety threshold of 960mA)."
  }
]
```

---

*Built with ❤️ for the DEV & Sanity Community by Shreyansh ([@Shreyansh00987](https://github.com/Shreyansh00987))*
