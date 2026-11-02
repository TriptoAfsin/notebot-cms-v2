import { type ChartConfig } from "@/components/evilcharts/ui/recharts-chart";

/**
 * One palette for every dashboard chart.
 *
 * EvilCharts takes explicit colour stops per series rather than CSS variables — gradient, duotone
 * and hatched fills each need two or three related values, which a single `var(--chart-1)` cannot
 * express. Keeping them in this module means they are still named in one place instead of being
 * scattered as literals across the view, and the light/dark pairs stay adjacent so a tweak to one
 * mode cannot silently skip the other.
 *
 * Notes take the Ledger accent (emerald); other series use calmer neighbours so the accent stays the loudest colour.
 */

type Stops = { light: string[]; dark: string[] };

export const PALETTE = {
  violet: { light: ["#8b5cf6", "#c4b5fd"], dark: ["#a78bfa", "#6d28d9"] },
  amber: { light: ["#f59e0b", "#fcd34d"], dark: ["#fbbf24", "#b45309"] },
  emerald: { light: ["#16a065", "#86d9b0"], dark: ["#3fcf8e", "#0f6b45"] }, // = --primary (Ledger accent)
  sky: { light: ["#0ea5e9", "#7dd3fc"], dark: ["#38bdf8", "#0369a1"] },
  pink: { light: ["#ec4899", "#f9a8d4"], dark: ["#f472b6", "#be185d"] },
  orange: { light: ["#f97316", "#fdba74"], dark: ["#fb923c", "#c2410c"] },
  teal: { light: ["#14b8a6", "#5eead4"], dark: ["#2dd4bf", "#0f766e"] },
  fuchsia: { light: ["#d946ef", "#f0abfc"], dark: ["#e879f9", "#a21caf"] },
  rose: { light: ["#f43f5e", "#fda4af"], dark: ["#fb7185", "#be123c"] },
  indigo: { light: ["#6366f1", "#a5b4fc"], dark: ["#818cf8", "#4338ca"] },
  slate: { light: ["#64748b", "#cbd5e1"], dark: ["#94a3b8", "#334155"] },
} satisfies Record<string, Stops>;

/** Deterministic colour per category, so a department keeps its hue across charts and reloads. */
const CYCLE: Stops[] = [
  PALETTE.emerald, PALETTE.sky, PALETTE.amber, PALETTE.violet, PALETTE.teal,
  PALETTE.slate, PALETTE.orange, PALETTE.indigo, PALETTE.pink, PALETTE.rose,
];

export function cycleConfig(keys: string[], labels?: (k: string) => string): ChartConfig {
  return Object.fromEntries(
    keys.map((k, i) => [k, { label: labels?.(k) ?? k, colors: CYCLE[i % CYCLE.length] }]),
  );
}

export const trafficConfig = {
  app: { label: "Web app", colors: PALETTE.emerald },
  bot: { label: "Messenger bot", colors: PALETTE.sky },
} satisfies ChartConfig;

export const perLevelConfig = {
  notes: { label: "Notes", colors: PALETTE.emerald },
  topics: { label: "Topics", colors: PALETTE.slate },
} satisfies ChartConfig;

export const contentMixConfig = {
  notes: { label: "Notes", colors: PALETTE.emerald },
  labReports: { label: "Lab Reports", colors: PALETTE.sky },
  questionBanks: { label: "Q. Banks", colors: PALETTE.amber },
  routines: { label: "Routines", colors: PALETTE.teal },
  syllabuses: { label: "Syllabuses", colors: PALETTE.violet },
} satisfies ChartConfig;

export const missedConfig = {
  hits: { label: "Searches", colors: PALETTE.amber }, // a gap to fill, not an error
} satisfies ChartConfig;
