import asyncio
import edge_tts
import os
import subprocess
import re

SCRIPT_TEXT = """
Meet Racksmith: an intelligent modular synthesizer rack planner that knows what actually fits, powers on, and won't fry your modules.

In Eurorack, builders constantly struggle with physical depth collisions, power rail overloads, and conflicting manufacturer manuals.

With Racksmith, you can plan complete systems with real-time verification. Here, an ambient starter voice in an Intellijel 7U case is validated across HP width and power draw, with an automatic eighty percent headroom buffer for safe power-on inrush current.

Racksmith prevents expensive hardware disasters. When inserting a vintage Doepfer VCO into a shallow Palette case, our deterministic engine detects a critical nine point five millimeter overrun against the power bus board, rendering the module in hazard red.

Powered by a Sanity Knowledge Lake and Model Context Protocol, Racksmith resolves real specification discrepancies. For Make Noise Maths, the manual claims sixty milliamps, but verified lab errata states ninety milliamps. Racksmith surfaces both claims with full provenance, lets you resolve it, and persists your decision to Sanity.

You can also ask the AI Agent naturally. The agent queries Sanity via MCP tools, performs deterministic math, inspects the live protocol wire, and automatically assembles the rack in interactive 3D.

Finally, export a complete Bill of Materials with manual citations, CSV, and print-ready spec sheets. Racksmith: precision hardware planning powered by Sanity Context and MCP.
""".strip()

OUTPUT_AUDIO = "demo_voiceover.mp3"

async def main():
    print("Generating AI Voiceover with edge-tts (en-US-ChristopherNeural)...")
    communicate = edge_tts.Communicate(SCRIPT_TEXT, "en-US-ChristopherNeural", rate="+14%")
    await communicate.save(OUTPUT_AUDIO)
    print("Voiceover saved to " + OUTPUT_AUDIO)

    # Check duration
    ffmpeg = r"node_modules\ffmpeg-static\ffmpeg.exe"
    res = subprocess.run([ffmpeg, "-i", OUTPUT_AUDIO], stderr=subprocess.PIPE, text=True)
    m = re.search(r"Duration: (\d+:\d+:\d+\.\d+)", res.stderr)
    if m:
        print("Final Audio Duration:", m.group(1))

if __name__ == "__main__":
    asyncio.run(main())
