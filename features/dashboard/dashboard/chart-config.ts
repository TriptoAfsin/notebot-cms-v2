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
 * Hues match the sidebar and KPI icons: notes are sky, lab reports pink, routines teal, and so on.
 */

type Stops = { light: string[]; dark: string[] };

export const PALETTE = {
  violet: { light: ["#8b5cf6", "#c4b5fd"], dark: ["#a78bfa", "#6d28d9"] },
  amber: { light: ["#f59e0b", "#fcd34d"], dark: ["#fbbf24", "#b45309"] },
  emerald: { light: ["#10b981", "#6ee7b7"], dark: ["#34d399", "#047857"] },
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
  PALETTE.sky, PALETTE.violet, PALETTE.emerald, PALETTE.amber, PALETTE.pink,
  PALETTE.teal, PALETTE.orange, PALETTE.indigo, PALETTE.fuchsia, PALETTE.rose,
];

export function cycleConfig(keys: string[], labels?: (k: string) => string): ChartConfig {
  return Object.fromEntries(
    keys.map((k, i) => [k, { label: labels?.(k) ?? k, colors: CYCLE[i % CYCLE.length] }]),
  );
}

export const trafficConfig = {
  app: { label: "Web app", colors: PALETTE.sky },
  bot: { label: "Messenger bot", colors: PALETTE.violet },
} satisfies ChartConfig;

export const perLevelConfig = {
  notes: { label: "Notes", colors: PALETTE.sky },
  topics: { label: "Topics", colors: PALETTE.emerald },
} satisfies ChartConfig;

export const contentMixConfig = {
  notes: { label: "Notes", colors: PALETTE.sky },
  labReports: { label: "Lab Reports", colors: PALETTE.pink },
  questionBanks: { label: "Q. Banks", colors: PALETTE.orange },
  routines: { label: "Routines", colors: PALETTE.teal },
  syllabuses: { label: "Syllabuses", colors: PALETTE.fuchsia },
} satisfies ChartConfig;

export const missedConfig = {
  hits: { label: "Searches", colors: PALETTE.rose },
} satisfies ChartConfig;
