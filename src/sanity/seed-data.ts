export interface ManufacturerDoc {
  _id: string
  _type: 'manufacturer'
  name: string
  website?: string
  description?: string
}

export interface ModuleDoc {
  _id: string
  _type: 'module'
  name: string
  manufacturerId: string
  manufacturerName: string
  hp: number
  depthMM: number
  powerPlus12: number
  powerMinus12: number
  power5V: number
  connectorType?: string
  sourceURL?: string
  revision?: string
  description?: string
  category?: 'oscillator' | 'filter' | 'modulator' | 'effect' | 'sequencer' | 'utility'
}

export interface CaseDoc {
  _id: string
  _type: 'case'
  name: string
  manufacturerId: string
  manufacturerName: string
  hp: number
  maxDepthMM: number
  powerCapacityPlus12: number
  powerCapacityMinus12: number
  powerCapacity5V: number
  busBoardType?: string
  sourceURL?: string
  revision?: string
}

export interface ClaimDoc {
  _id: string
  _type: 'claim'
  statement: string
  entityId: string
  entityType: 'module' | 'case'
  field: string
  value: string
  source: string
  sourceURL?: string
  confidence: number
  revision?: string
  timestamp?: string
  context?: string
}

export interface ContradictionDoc {
  _id: string
  _type: 'contradiction'
  entityId: string
  entityName: string
  field: string
  claimA: ClaimDoc
  claimB: ClaimDoc
  status: 'unresolved' | 'resolved'
  explanation: string
  impactAnalysis: string
}

export interface CompatibilityRuleDoc {
  _id: string
  _type: 'compatibilityRule'
  moduleId: string
  moduleName: string
  caseId: string
  caseName: string
  clearanceRequired: number
  status: 'FAIL' | 'WARNING'
  notes: string
  source: string
}

export const SEED_MANUFACTURERS: ManufacturerDoc[] = [
  { _id: 'mfg-make-noise', _type: 'manufacturer', name: 'Make Noise', website: 'https://makenoisemusic.com', description: 'Asheville, NC modular synth pioneer known for West Coast synthesis & analog/digital hybrid circuits.' },
  { _id: 'mfg-intellijel', _type: 'manufacturer', name: 'Intellijel', website: 'https://intellijel.com', description: 'Vancouver-based manufacturer celebrated for high-density, performance-focused modules and aluminum cases.' },
  { _id: 'mfg-mutable-instruments', _type: 'manufacturer', name: 'Mutable Instruments', website: 'https://mutable-instruments.net', description: 'Legendary open-source French modular DSP brand designed by Émilie Gillet.' },
  { _id: 'mfg-doepfer', _type: 'manufacturer', name: 'Doepfer', website: 'https://doepfer.de', description: 'The inventor of the Eurorack A-100 standard created by Dieter Doepfer in 1995.' },
  { _id: 'mfg-alm', _type: 'manufacturer', name: 'ALM Busy Circuits', website: 'https://busycircuits.com', description: 'UK maker specializing in rhythmic digital sequencers, clocking hubs, and retro-modern synth gear.' },
  { _id: 'mfg-qubit', _type: 'manufacturer', name: 'Qu-Bit Electronix', website: 'https://qubit-electronix.com', description: 'San Clemente creator of micro-controller DSP modules and ambient spatial sound design utilities.' },
  { _id: 'mfg-noise-eng', _type: 'manufacturer', name: 'Noise Engineering', website: 'https://noiseengineering.us', description: 'Los Angeles based industrial and algorithmic modular synthesis company.' },
  { _id: 'mfg-expert-sleepers', _type: 'manufacturer', name: 'Expert Sleepers', website: 'https://expert-sleepers.co.uk', description: 'UK-based DSP developer known for multi-function modules, digital audio, and CV converters.' }
]

export const SEED_CASES: CaseDoc[] = [
  {
    _id: 'case-palette-62',
    _type: 'case',
    name: 'Intellijel Palette 62',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 62,
    maxDepthMM: 45.5,
    powerCapacityPlus12: 1200,
    powerCapacityMinus12: 1200,
    powerCapacity5V: 500,
    busBoardType: 'Integrated TPS30W',
    sourceURL: 'https://intellijel.com/shop/cases/palette-case/',
    revision: 'Rev 2.0'
  },
  {
    _id: 'case-intellijel-7u-84',
    _type: 'case',
    name: 'Intellijel 7U 84HP Performance Case',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 84,
    maxDepthMM: 53.0,
    powerCapacityPlus12: 3000,
    powerCapacityMinus12: 1500,
    powerCapacity5V: 1500,
    busBoardType: 'TPS80W MAX Triple Rail',
    sourceURL: 'https://intellijel.com/shop/cases/7u-performance-case-84hp/',
    revision: 'TPS80W Rev B'
  },
  {
    _id: 'case-doepfer-a100-lc9',
    _type: 'case',
    name: 'Doepfer A-100 Low Cost 9U 84HP',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 84,
    maxDepthMM: 70.0,
    powerCapacityPlus12: 1200,
    powerCapacityMinus12: 1200,
    powerCapacity5V: 100,
    busBoardType: 'PSU2 Dual Bus',
    sourceURL: 'https://doepfer.de/a100_lc9.htm',
    revision: 'PSU2 Classic'
  },
  {
    _id: 'case-pod-40',
    _type: 'case',
    name: '4ms Pod 40 (Ultra-Shallow)',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: '4ms Company',
    hp: 40,
    maxDepthMM: 34.0,
    powerCapacityPlus12: 700,
    powerCapacityMinus12: 700,
    powerCapacity5V: 0,
    busBoardType: 'Integrated Barrel Input',
    sourceURL: 'https://4mscompany.com/pods.php',
    revision: 'v1.2'
  }
]

export const SEED_MODULES: ModuleDoc[] = [
  // --- Make Noise ---
  {
    _id: 'mod-maths',
    _type: 'module',
    name: 'Maths',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 20,
    depthMM: 24,
    powerPlus12: 60, // Baseline manual spec; revision errata is 90mA
    powerMinus12: 50,
    power5V: 0,
    connectorType: '16-pin Eurorack',
    sourceURL: 'https://makenoisemusic.com/manuals/mathsmanual.pdf',
    revision: 'Rev 1.0 (Manual) / Rev 1.1 (Lab)',
    category: 'modulator',
    description: 'Dual analog computer, envelope generator, LFO, slew limiter, sub-harmonic oscillator and CV mixer.'
  },
  {
    _id: 'mod-morphagene',
    _type: 'module',
    name: 'Morphagene',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 20,
    depthMM: 45,
    powerPlus12: 165,
    powerMinus12: 17,
    power5V: 0,
    sourceURL: 'https://makenoisemusic.com/manuals/morphagenemanual.pdf',
    revision: 'MG208',
    category: 'effect',
    description: 'Tape and microsound music phonogene using SD-card reels for granular synthesis.'
  },
  {
    _id: 'mod-mimeophon',
    _type: 'module',
    name: 'Mimeophon',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 12,
    depthMM: 45,
    powerPlus12: 100,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://makenoisemusic.com/manuals/mimeophon-manual.pdf',
    revision: 'v1.4',
    category: 'effect',
    description: 'Multi-zone stereo color audio repeater and spatial time-domain processor with Soundhack algorithms.'
  },
  {
    _id: 'mod-qpas',
    _type: 'module',
    name: 'QPAS',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 18,
    depthMM: 30,
    powerPlus12: 166,
    powerMinus12: 190,
    power5V: 0,
    sourceURL: 'https://makenoisemusic.com/manuals/QPAS-manual.pdf',
    revision: 'v1.1',
    category: 'filter',
    description: 'Quad Peak Animation Stereo Filter with four resonant cores and radiating sub-peaks.'
  },
  {
    _id: 'mod-rene-v2',
    _type: 'module',
    name: 'René v2',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 34,
    depthMM: 24,
    powerPlus12: 235,
    powerMinus12: 0,
    power5V: 0,
    sourceURL: 'https://makenoisemusic.com/manuals/rene2manual.pdf',
    revision: 'v2.0',
    category: 'sequencer',
    description: '3D Cartesian cartesian sequencer with snake and touch grid navigation.'
  },
  {
    _id: 'mod-spectraphon',
    _type: 'module',
    name: 'Spectraphon',
    manufacturerId: 'mfg-make-noise',
    manufacturerName: 'Make Noise',
    hp: 14,
    depthMM: 36,
    powerPlus12: 230,
    powerMinus12: 55,
    power5V: 0,
    sourceURL: 'https://makenoisemusic.com/manuals/spectraphon-manual.pdf',
    revision: 'v1.0.3',
    category: 'oscillator',
    description: 'Dual Spectral Oscillator using real-time spectral analysis and resynthesis.'
  },

  // --- Mutable Instruments ---
  {
    _id: 'mod-plaits',
    _type: 'module',
    name: 'Plaits',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 12,
    depthMM: 25,
    powerPlus12: 50,
    powerMinus12: 5,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/plaits/manual/',
    revision: 'v1.2',
    category: 'oscillator',
    description: 'Macro-oscillator with 16 distinct digital synthesis models for melodic, percussive and noise sounds.'
  },
  {
    _id: 'mod-rings',
    _type: 'module',
    name: 'Rings',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 14,
    depthMM: 25,
    powerPlus12: 120,
    powerMinus12: 5,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/rings/manual/',
    revision: 'v1.1',
    category: 'oscillator',
    description: 'Resonator providing physical modeling synthesis based on strings, membranes, and sympathetic tubes.'
  },
  {
    _id: 'mod-clouds',
    _type: 'module',
    name: 'Clouds',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 18,
    depthMM: 35,
    powerPlus12: 120,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/clouds/manual/',
    revision: 'v1.0',
    category: 'effect',
    description: 'Real-time granular audio processor and textural sound dissipator.'
  },
  {
    _id: 'mod-beads',
    _type: 'module',
    name: 'Beads',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 14,
    depthMM: 25,
    powerPlus12: 100,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/beads/manual/',
    revision: 'v1.1',
    category: 'effect',
    description: 'Successor to Clouds with cleaner 24-bit audio path, grain density controls, and built-in reverb.'
  },
  {
    _id: 'mod-marbles',
    _type: 'module',
    name: 'Marbles',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 18,
    depthMM: 25,
    powerPlus12: 80,
    powerMinus12: 20,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/marbles/manual/',
    revision: 'v1.2',
    category: 'modulator',
    description: 'Random voltage generator and organic clock source modeled on the concept of dice and marbles.'
  },
  {
    _id: 'mod-stages',
    _type: 'module',
    name: 'Stages',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 14,
    depthMM: 25,
    powerPlus12: 80,
    powerMinus12: 20,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/stages/manual/',
    revision: 'v1.0',
    category: 'modulator',
    description: 'Segment generator configurable as ramp, step, hold, multi-stage envelope, or LFO.'
  },
  {
    _id: 'mod-ripples',
    _type: 'module',
    name: 'Ripples (v2020)',
    manufacturerId: 'mfg-mutable-instruments',
    manufacturerName: 'Mutable Instruments',
    hp: 8,
    depthMM: 25,
    powerPlus12: 40,
    powerMinus12: 40,
    power5V: 0,
    sourceURL: 'https://mutable-instruments.net/modules/ripples/manual/',
    revision: 'v2020',
    category: 'filter',
    description: 'Liquid analog 4-pole low-pass filter with clean resonance and built-in overdrive VCA.'
  },

  // --- Intellijel ---
  {
    _id: 'mod-rainmaker',
    _type: 'module',
    name: 'Rainmaker',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 36,
    depthMM: 42, // Official manual claims 42mm; with rear power header cable it is 46mm!
    powerPlus12: 270,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/rainmaker_manual_2021.05.03.pdf',
    revision: 'Rev 1.3',
    category: 'effect',
    description: '16-tap delay and comb resonator engine designed with Dr. Ryoji Ikeda.'
  },
  {
    _id: 'mod-quadrax',
    _type: 'module',
    name: 'Quadrax',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 14,
    depthMM: 38,
    powerPlus12: 106,
    powerMinus12: 9,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/quadrax_manual_2022.01.10.pdf',
    revision: 'v1.3',
    category: 'modulator',
    description: 'Four-channel universal function generator, burst generator, and quadrature LFO.'
  },
  {
    _id: 'mod-metropolis',
    _type: 'module',
    name: 'Metropolis',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 34,
    depthMM: 45,
    powerPlus12: 195,
    powerMinus12: 8,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/metropolis_manual.pdf',
    revision: 'v1.33',
    category: 'sequencer',
    description: 'Pitch slider sequencer inspired by the classic Roland R-8/MFB step sequencers.'
  },
  {
    _id: 'mod-dixie2plus',
    _type: 'module',
    name: 'Dixie II+',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 6,
    depthMM: 40,
    powerPlus12: 60,
    powerMinus12: 50,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/dixie2plus_manual.pdf',
    revision: 'v2.1',
    category: 'oscillator',
    description: 'Triangle-core analog VCO/LFO with ultra-stable tracking and 6 waveform outputs.'
  },
  {
    _id: 'mod-sealegs',
    _type: 'module',
    name: 'Sealegs',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 20,
    depthMM: 40,
    powerPlus12: 220,
    powerMinus12: 25,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/sealegs_manual.pdf',
    revision: 'v1.0',
    category: 'effect',
    description: 'Multi-model stereo delay with bucket brigade, tape, and digital modeling plus lush reverb.'
  },
  {
    _id: 'mod-scales',
    _type: 'module',
    name: 'Scales',
    manufacturerId: 'mfg-intellijel',
    manufacturerName: 'Intellijel',
    hp: 8,
    depthMM: 29,
    powerPlus12: 35,
    powerMinus12: 5,
    power5V: 0,
    sourceURL: 'https://intellijel.com/manuals/scales_manual.pdf',
    revision: 'v1.1',
    category: 'utility',
    description: 'Dual quantizer and 128-step pattern recorder with chromatic keyboard interface.'
  },

  // --- Doepfer (Deep modules that collide with shallow cases!) ---
  {
    _id: 'mod-doepfer-a110',
    _type: 'module',
    name: 'Doepfer A-110-1 Standard VCO',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 10,
    depthMM: 55, // 55mm deep! Exceeds Palette 62 (45.5mm) and Pod 40 (34mm)
    powerPlus12: 150,
    powerMinus12: 50,
    power5V: 0,
    sourceURL: 'https://doepfer.de/a110_man.htm',
    revision: 'THT Vintage 65mm / SMD Modern 50mm',
    category: 'oscillator',
    description: 'Classic CEM3340-based analog oscillator with full through-hole vertical daughterboard PCB.'
  },
  {
    _id: 'mod-doepfer-a199',
    _type: 'module',
    name: 'Doepfer A-199 Spring Reverb',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 8,
    depthMM: 65, // Massive 65mm depth due to internal 3-spring tank mounting!
    powerPlus12: 80,
    powerMinus12: 50,
    power5V: 0,
    sourceURL: 'https://doepfer.de/a199.htm',
    revision: 'Rev 2.0',
    category: 'effect',
    description: 'Real analog spring reverberation unit featuring an electromechanical three-spring system.'
  },
  {
    _id: 'mod-doepfer-a124',
    _type: 'module',
    name: 'Doepfer A-124 Wasp Filter',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 8,
    depthMM: 40,
    powerPlus12: 30,
    powerMinus12: 20,
    power5V: 0,
    sourceURL: 'https://doepfer.de/a124.htm',
    revision: 'SMD Rev 2021',
    category: 'filter',
    description: 'Famous dirty multi-mode filter utilizing digital CMOS inverters in an unstable analog circuit.'
  },
  {
    _id: 'mod-doepfer-a140',
    _type: 'module',
    name: 'Doepfer A-140-2 Dual ADSR',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 8,
    depthMM: 40,
    powerPlus12: 50,
    powerMinus12: 40,
    power5V: 0,
    sourceURL: 'https://doepfer.de/a1402.htm',
    revision: 'v1.1',
    category: 'modulator',
    description: 'Dual analog envelope generator with CV-controlled attack and decay rates.'
  },
  {
    _id: 'mod-doepfer-a138s',
    _type: 'module',
    name: 'Doepfer A-138s Mini Mixer',
    manufacturerId: 'mfg-doepfer',
    manufacturerName: 'Doepfer',
    hp: 4,
    depthMM: 20,
    powerPlus12: 10,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://doepfer.de/a138s.htm',
    revision: 'v1.0',
    category: 'utility',
    description: 'Compact 4-channel mono-to-stereo panned utility mixer for audio and CV signals.'
  },

  // --- ALM Busy Circuits ---
  {
    _id: 'mod-pamela-pro',
    _type: 'module',
    name: "Pamela's PRO Workout",
    manufacturerId: 'mfg-alm',
    manufacturerName: 'ALM Busy Circuits',
    hp: 8,
    depthMM: 32,
    powerPlus12: 50,
    powerMinus12: 0,
    power5V: 0,
    sourceURL: 'https://busycircuits.com/alm034/',
    revision: 'ALM034 v1.2',
    category: 'modulator',
    description: 'Programmable 8-channel clocked modulation hub, Euclidean rhythm generator, and quantizer.'
  },
  {
    _id: 'mod-squid-salmple',
    _type: 'module',
    name: 'Squid Salmple',
    manufacturerId: 'mfg-alm',
    manufacturerName: 'ALM Busy Circuits',
    hp: 21,
    depthMM: 38,
    powerPlus12: 210,
    powerMinus12: 30,
    power5V: 0,
    sourceURL: 'https://busycircuits.com/alm022/',
    revision: 'ALM022 v1.8',
    category: 'oscillator',
    description: '8-channel live audio sampler with real-time pitch shifting and low-latency USB playback.'
  },
  {
    _id: 'mod-mfx',
    _type: 'module',
    name: 'ALM MFX',
    manufacturerId: 'mfg-alm',
    manufacturerName: 'ALM Busy Circuits',
    hp: 6,
    depthMM: 32,
    powerPlus12: 70,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://busycircuits.com/alm032/',
    revision: 'ALM032',
    category: 'effect',
    description: 'Multi-FX processor delivering classic digital delays, pitch shifters, and bitcrush algorithms.'
  },

  // --- Qu-Bit Electronix ---
  {
    _id: 'mod-aurora',
    _type: 'module',
    name: 'Aurora',
    manufacturerId: 'mfg-qubit',
    manufacturerName: 'Qu-Bit Electronix',
    hp: 12,
    depthMM: 22,
    powerPlus12: 215,
    powerMinus12: 6,
    power5V: 0,
    sourceURL: 'https://qubit-electronix.com/products/aurora',
    revision: 'v1.1',
    category: 'effect',
    description: 'Spectral reverb audio processor capable of time-stretching and FFT phase vocoding.'
  },
  {
    _id: 'mod-bloom',
    _type: 'module',
    name: 'Bloom',
    manufacturerId: 'mfg-qubit',
    manufacturerName: 'Qu-Bit Electronix',
    hp: 16,
    depthMM: 23,
    powerPlus12: 82,
    powerMinus12: 0,
    power5V: 0,
    sourceURL: 'https://qubit-electronix.com/products/bloom',
    revision: 'v1.2',
    category: 'sequencer',
    description: 'Fractal melodic sequencer that generates branching melodies from a root pattern.'
  },
  {
    _id: 'mod-nautilus',
    _type: 'module',
    name: 'Nautilus',
    manufacturerId: 'mfg-qubit',
    manufacturerName: 'Qu-Bit Electronix',
    hp: 14,
    depthMM: 22,
    powerPlus12: 151,
    powerMinus12: 15,
    power5V: 0,
    sourceURL: 'https://qubit-electronix.com/products/nautilus',
    revision: 'v1.0.5',
    category: 'effect',
    description: 'Sub-nautical complex delay network inspired by ocean sonar navigation.'
  },

  // --- Noise Engineering ---
  {
    _id: 'mod-bia',
    _type: 'module',
    name: 'Basimilus Iteritas Alter',
    manufacturerId: 'mfg-noise-eng',
    manufacturerName: 'Noise Engineering',
    hp: 10,
    depthMM: 38,
    powerPlus12: 150,
    powerMinus12: 5,
    power5V: 0,
    sourceURL: 'https://noiseengineering.us/products/basimilus-iteritas-alter',
    revision: 'Rev C',
    category: 'oscillator',
    description: 'Aggressive parameterized digital drum synth and metallic bass voice.'
  },
  {
    _id: 'mod-desmodus-versio',
    _type: 'module',
    name: 'Desmodus Versio',
    manufacturerId: 'mfg-noise-eng',
    manufacturerName: 'Noise Engineering',
    hp: 10,
    depthMM: 38,
    powerPlus12: 125,
    powerMinus12: 10,
    power5V: 0,
    sourceURL: 'https://noiseengineering.us/products/desmodus-versio',
    revision: 'Rev B',
    category: 'effect',
    description: 'Stereo synthetic tail reverb and DSP platform designed for ambient and industrial swells.'
  },

  // --- Expert Sleepers ---
  {
    _id: 'mod-disting-ex',
    _type: 'module',
    name: 'Disting EX Alpha',
    manufacturerId: 'mfg-expert-sleepers',
    manufacturerName: 'Expert Sleepers',
    hp: 8,
    depthMM: 50, // 50mm deep!
    powerPlus12: 229,
    powerMinus12: 85,
    power5V: 0,
    sourceURL: 'https://expert-sleepers.co.uk/distingEX.html',
    revision: 'Firmware v1.14',
    category: 'utility',
    description: 'Multifunctional DSP module with matrix sampler, wavetable synth, dual delays, and audio recorder.'
  }
]

export const SEED_CONTRADICTIONS: ContradictionDoc[] = [
  {
    _id: 'contradiction-maths-power',
    _type: 'contradiction',
    entityId: 'mod-maths',
    entityName: 'Make Noise Maths',
    field: 'powerPlus12',
    status: 'unresolved',
    explanation: 'Discrepancy in the reported +12V power consumption for Make Noise Maths. The printed manual states 60mA, but official technical bulletin and ModularGrid lab measurements verify 90mA under active LED slew cycling.',
    impactAnalysis: 'Selecting 90mA increases +12V rail utilization by 30mA. In a Palette 62 or 4ms Pod case, this can shift power load from safe into the 80%+ warning zone.',
    claimA: {
      _id: 'claim-maths-60ma',
      _type: 'claim',
      statement: 'Maths draws 60mA on the +12V rail.',
      entityId: 'mod-maths',
      entityType: 'module',
      field: 'powerPlus12',
      value: '60',
      source: 'Make Noise Maths User Manual (2022 Print)',
      sourceURL: 'https://makenoisemusic.com/manuals/mathsmanual.pdf',
      confidence: 80,
      revision: 'Rev 1.0 (2022)',
      context: 'Initial quiescent measurement with slew channels idle.'
    },
    claimB: {
      _id: 'claim-maths-90ma',
      _type: 'claim',
      statement: 'Revised specification is 90mA on the +12V rail under load.',
      entityId: 'mod-maths',
      entityType: 'module',
      field: 'powerPlus12',
      value: '90',
      source: 'Make Noise Engineering Errata & ModularGrid Lab Bench Test',
      sourceURL: 'https://makenoisemusic.com/support/tech-notes/',
      confidence: 95,
      revision: 'Rev 1.1 (2023)',
      context: 'Peak draw measurement with both cycle switches active and LEDs fully illuminated.'
    }
  },
  {
    _id: 'contradiction-rainmaker-depth',
    _type: 'contradiction',
    entityId: 'mod-rainmaker',
    entityName: 'Intellijel Rainmaker',
    field: 'depthMM',
    status: 'unresolved',
    explanation: 'Intellijel official manual lists module depth as 42mm. However, when the 16-pin Eurorack power ribbon cable is seated in the rear shroud, the required mechanical clearance is 46mm.',
    impactAnalysis: 'The Intellijel Palette 62 provides exactly 45.5mm depth. At 42mm the module fits; at 46mm the cable connector presses directly against the case bus board, causing physical collision.',
    claimA: {
      _id: 'claim-rainmaker-42mm',
      _type: 'claim',
      statement: 'Rainmaker depth is 42mm.',
      entityId: 'mod-rainmaker',
      entityType: 'module',
      field: 'depthMM',
      value: '42',
      source: 'Intellijel Official Specifications Sheet (2021)',
      sourceURL: 'https://intellijel.com/manuals/rainmaker_manual_2021.05.03.pdf',
      confidence: 85,
      revision: 'Manual Spec 2021',
      context: 'Bare PCB depth without ribbon connector clearance.'
    },
    claimB: {
      _id: 'claim-rainmaker-46mm',
      _type: 'claim',
      statement: 'Rainmaker requires 46mm real clearance including standard IDC power cable.',
      entityId: 'mod-rainmaker',
      entityType: 'module',
      field: 'depthMM',
      value: '46',
      source: 'Muff Wiggler / ModWiggler Hardware Clearance Measurements',
      sourceURL: 'https://modwiggler.com/forum/viewtopic.php?t=19421',
      confidence: 95,
      revision: 'Physical Hardware Audit 2023',
      context: 'Measured with standard 16-pin shrouded power ribbon cable attached.'
    }
  },
  {
    _id: 'contradiction-doepfer-depth',
    _type: 'contradiction',
    entityId: 'mod-doepfer-a110',
    entityName: 'Doepfer A-110-1 VCO',
    field: 'depthMM',
    status: 'unresolved',
    explanation: 'Vintage through-hole (THT) production units of the A-110-1 measure 65mm deep. Modern surface-mount (SMD) revisions released after 2018 measure 50mm deep.',
    impactAnalysis: 'Both versions exceed shallow cases like Palette 62 (45.5mm max) and Pod 40 (34mm max), but modern SMD units fit into 7U performance cases while vintage units collide with internal power supplies.',
    claimA: {
      _id: 'claim-doepfer-vintage-65mm',
      _type: 'claim',
      statement: 'A-110-1 depth is 65mm (Vintage THT Daughterboard).',
      entityId: 'mod-doepfer-a110',
      entityType: 'module',
      field: 'depthMM',
      value: '65',
      source: 'Doepfer Classic A-100 Manual Archive',
      sourceURL: 'https://doepfer.de/a110_man.htm',
      confidence: 90,
      revision: 'Vintage THT (pre-2018)',
      context: 'Through-hole discrete component vertical assembly.'
    },
    claimB: {
      _id: 'claim-doepfer-smd-50mm',
      _type: 'claim',
      statement: 'A-110-1 depth is 50mm (Modern SMD Production).',
      entityId: 'mod-doepfer-a110',
      entityType: 'module',
      field: 'depthMM',
      value: '50',
      source: 'Doepfer Factory Product Catalog (2022)',
      sourceURL: 'https://doepfer.de/a110.htm',
      confidence: 98,
      revision: 'Modern SMD (post-2018)',
      context: 'Redesigned single compact SMD PCB.'
    }
  }
]

export const SEED_COMPATIBILITY_RULES: CompatibilityRuleDoc[] = [
  {
    _id: 'rule-a110-palette',
    _type: 'compatibilityRule',
    moduleId: 'mod-doepfer-a110',
    moduleName: 'Doepfer A-110-1 Standard VCO',
    caseId: 'case-palette-62',
    caseName: 'Intellijel Palette 62',
    clearanceRequired: 50.0,
    status: 'FAIL',
    notes: 'The A-110-1 requires at least 50mm depth (up to 65mm for vintage THT units). The Palette 62 case provides only 45.5mm depth. Physical collision occurs with the TPS30W bus board.',
    source: 'Intellijel Palette Hardware Dimensions Guide / Doepfer A-100 Physical Spec'
  },
  {
    _id: 'rule-a199-palette',
    _type: 'compatibilityRule',
    moduleId: 'mod-doepfer-a199',
    moduleName: 'Doepfer A-199 Spring Reverb',
    caseId: 'case-palette-62',
    caseName: 'Intellijel Palette 62',
    clearanceRequired: 65.0,
    status: 'FAIL',
    notes: 'The A-199 internal spring tank is 65mm deep and cannot fit inside the Palette 62 (45.5mm depth limit).',
    source: 'Doepfer A-199 Technical Manual'
  },
  {
    _id: 'rule-rainmaker-palette',
    _type: 'compatibilityRule',
    moduleId: 'mod-rainmaker',
    moduleName: 'Intellijel Rainmaker',
    caseId: 'case-palette-62',
    caseName: 'Intellijel Palette 62',
    clearanceRequired: 46.0,
    status: 'WARNING',
    notes: 'Rainmaker bare PCB is 42mm, but with standard power connector attached requires 46mm. In Palette 62 (45.5mm), it requires a low-profile right-angle power ribbon cable to avoid board strain.',
    source: 'ModWiggler Palette Builders Guide'
  }
]
