import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Search, TrendingUp, Trophy, Activity, ShieldCheck, Flag } from "lucide-react";
import {
  BENCHMARKS,
  DATASET_VALIDATION,
  META,
  ORG_COLORS,
  TEST_RESULTS,
  PreparedBenchmarkRow,
  BenchmarkName,
  fmtDate,
  fmtMonth,
  getFrontierData,
  getHumanCrossing,
  getOrganizationsForBenchmark,
  getScopedData,
  getXDomain,
  groupRowsByOrg,
} from "./benchmark-dashboard-core";

type TooltipPayloadItem = {
  payload?: PreparedBenchmarkRow;
};

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
            {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
          </div>
          <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm transition ${
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : active
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const candidate = payload.find((item) => item?.payload?.model)?.payload;
  if (!candidate?.model) {
    return null;
  }

  return (
    <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{candidate.model}</div>
      <div className="mt-1 text-xs text-slate-500">
        {candidate.org} • {candidate.benchmark}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
        <div className="text-slate-500">Date</div>
        <div className="text-right font-medium text-slate-900">{fmtDate(candidate.ts)}</div>
        <div className="text-slate-500">Score</div>
        <div className="text-right font-medium text-slate-900">{candidate.score}%</div>
        {candidate.isVerified ? (
          <>
            <div className="text-slate-500">Raw HLE</div>
            <div className="text-right font-medium text-slate-900">{candidate.rawScore}%</div>
            <div className="text-slate-500">Verified gain</div>
            <div className="text-right font-medium text-emerald-700">+{candidate.delta} pts</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function BenchmarkTimelineDashboard() {
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkName>("ARC-AGI-2");
  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All");
  const [showFrontier, setShowFrontier] = useState(true);
  const [showHuman, setShowHuman] = useState(true);

  const scoped = useMemo(
    () => getScopedData(selectedBenchmark, orgFilter, query),
    [selectedBenchmark, orgFilter, query],
  );

  const orgs = useMemo(() => getOrganizationsForBenchmark(selectedBenchmark), [selectedBenchmark]);
  const grouped = useMemo(() => groupRowsByOrg(scoped), [scoped]);
  const frontierData = useMemo(() => getFrontierData(scoped), [scoped]);
  const humanAnchor = META[selectedBenchmark].human;
  const humanCrossing = useMemo(() => getHumanCrossing(scoped, humanAnchor), [scoped, humanAnchor]);
  const xDomain = useMemo(() => getXDomain(scoped), [scoped]);

  const top = scoped.reduce<PreparedBenchmarkRow | null>(
    (best, row) => (!best || row.score > best.score ? row : best),
    null,
  );
  const first = scoped[0] ?? null;
  const last = scoped[scoped.length - 1] ?? null;
  const frontierGain =
    frontierData.length > 0
      ? frontierData[frontierData.length - 1].frontier - frontierData[0].frontier
      : 0;
  const avgVerifiedDelta =
    selectedBenchmark === "HLE-Verified" && scoped.length > 0
      ? (
          scoped.reduce((sum, row) => sum + (row.isVerified ? row.delta : 0), 0) /
          scoped.length
        ).toFixed(1)
      : null;

  const crossoverValue =
    humanAnchor === null ? "—" : humanCrossing ? fmtDate(humanCrossing.ts) : "Not yet";
  const crossoverSub =
    humanAnchor === null
      ? "No public human anchor"
      : humanCrossing
        ? `${humanCrossing.model} • ${humanCrossing.score}%`
        : `Human anchor at ${humanAnchor}%`;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            Interactive benchmark timeline • UTC-safe dates • Typed dataset validation
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ARC-AGI-2, HLE / HLE-Verified, and GPQA over time
          </h1>
          <p className="max-w-4xl text-sm text-slate-600">
            Compare model releases across frontier reasoning benchmarks. Dots are model entries on the
            selected benchmark, the line shows the best score achieved so far over time, and the red flag
            marks the first point where AI crossed the human anchor when a public anchor exists.
          </p>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              {BENCHMARKS.map((benchmark) => (
                <button
                  key={benchmark}
                  type="button"
                  onClick={() => {
                    setSelectedBenchmark(benchmark);
                    setOrgFilter("All");
                    setQuery("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedBenchmark === benchmark
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {benchmark}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by model or organization"
                  aria-label="Filter visible benchmark rows"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                />
              </div>

              <select
                value={orgFilter}
                aria-label="Filter by organization"
                onChange={(event) => setOrgFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
              >
                {orgs.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>

              <ToggleButton active={showFrontier} onClick={() => setShowFrontier((value) => !value)}>
                Frontier line
              </ToggleButton>

              <ToggleButton
                active={showHuman}
                disabled={humanAnchor === null}
                onClick={() => setShowHuman((value) => !value)}
              >
                Human reference
              </ToggleButton>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">About this view:</span> {META[selectedBenchmark].note}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Visible points" value={scoped.length} sub={selectedBenchmark} icon={Activity} />
          <StatCard
            title="Best score"
            value={top ? `${top.score}%` : "—"}
            sub={top ? `${top.model} • ${fmtDate(top.ts)}` : "No data"}
            icon={Trophy}
          />
          <StatCard
            title="Frontier gain"
            value={`${frontierGain >= 0 ? "+" : ""}${frontierGain.toFixed(1)} pts`}
            sub={first && last ? `${fmtDate(first.ts)} → ${fmtDate(last.ts)}` : "No range"}
            icon={TrendingUp}
          />
          <StatCard
            title={selectedBenchmark === "HLE-Verified" ? "Avg verified gain" : "Human crossover"}
            value={selectedBenchmark === "HLE-Verified" ? `${avgVerifiedDelta || "—"} pts` : crossoverValue}
            sub={selectedBenchmark === "HLE-Verified" ? "Raw HLE → HLE-Verified uplift" : crossoverSub}
            icon={selectedBenchmark === "HLE-Verified" ? Activity : Flag}
          />
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {grouped.map(({ org }) => (
                <div
                  key={org}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-slate-200"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ORG_COLORS[org] || "#64748b" }}
                  />
                  {org}
                </div>
              ))}
            </div>

            {scoped.length === 0 ? (
              <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                No rows match the current filters.
              </div>
            ) : (
              <div className="h-[520px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart margin={{ top: 10, right: 24, left: 4, bottom: 10 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={xDomain}
                      tickFormatter={fmtMonth}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#cbd5e1"
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      domain={[0, 100]}
                      tickFormatter={(value: number) => `${value}%`}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#cbd5e1"
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {showHuman && humanAnchor !== null ? (
                      <ReferenceLine
                        y={humanAnchor}
                        stroke="#94a3b8"
                        strokeDasharray="6 6"
                        label={{
                          value: `Human ≈ ${humanAnchor}%`,
                          fill: "#64748b",
                          fontSize: 12,
                          position: "insideTopRight",
                        }}
                      />
                    ) : null}

                    {showHuman && humanAnchor !== null && humanCrossing ? (
                      <>
                        <ReferenceLine
                          x={humanCrossing.x}
                          stroke="#dc2626"
                          strokeDasharray="4 4"
                          label={{
                            value: "AI crossed human",
                            fill: "#991b1b",
                            fontSize: 12,
                            position: "insideTopLeft",
                          }}
                        />
                        <ReferenceDot
                          x={humanCrossing.x}
                          y={humanCrossing.y}
                          r={7}
                          fill="#dc2626"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      </>
                    ) : null}

                    {showFrontier ? (
                      <Line
                        type="monotone"
                        data={frontierData}
                        dataKey="frontier"
                        xAxisId={0}
                        yAxisId={0}
                        stroke="#0f172a"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ) : null}

                    {grouped.map(({ org, rows }) => (
                      <Scatter
                        key={org}
                        name={org}
                        data={rows}
                        xAxisId={0}
                        yAxisId={0}
                        fill={ORG_COLORS[org] || "#64748b"}
                        line={false}
                        shape="circle"
                        isAnimationActive={false}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Visible entries</CardTitle>
          </CardHeader>
          <CardContent>
            {scoped.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No entries match the active query and organization filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Model</th>
                      <th className="py-3 pr-4 font-medium">Organization</th>
                      <th className="py-3 pr-4 font-medium">Score</th>
                      {selectedBenchmark === "HLE-Verified" ? (
                        <th className="py-3 pr-4 font-medium">Raw HLE</th>
                      ) : null}
                      {selectedBenchmark === "HLE-Verified" ? (
                        <th className="py-3 pr-4 font-medium">Gain</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {[...scoped]
                      .sort((a, b) => b.ts - a.ts || b.score - a.score || a.model.localeCompare(b.model))
                      .map((row) => {
                        const isHumanCrossing = humanCrossing
                          ? row.id === humanCrossing.id
                          : false;

                        return (
                          <tr
                            key={row.id}
                            className={`border-b border-slate-100 align-top ${
                              isHumanCrossing ? "bg-rose-50" : ""
                            }`}
                          >
                            <td className="py-3 pr-4 text-slate-600">{fmtDate(row.ts)}</td>
                            <td className="py-3 pr-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                {isHumanCrossing ? <Flag className="h-4 w-4 text-rose-600" /> : null}
                                <span>{row.model}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-slate-600">{row.org}</td>
                            <td className="py-3 pr-4 text-slate-900">{row.score}%</td>
                            {selectedBenchmark === "HLE-Verified" ? (
                              <td className="py-3 pr-4 text-slate-600">
                                {row.isVerified ? `${row.rawScore}%` : "—"}
                              </td>
                            ) : null}
                            {selectedBenchmark === "HLE-Verified" ? (
                              <td className="py-3 pr-4 font-medium text-emerald-700">
                                {row.isVerified ? `+${row.delta}` : "—"}
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5" />
              Dataset validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                DATASET_VALIDATION.errorCount === 0
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {DATASET_VALIDATION.errorCount === 0
                ? `Validated ${DATASET_VALIDATION.rowCount} rows across ${DATASET_VALIDATION.benchmarkCount} benchmarks and ${DATASET_VALIDATION.orgCount} organizations.`
                : `${DATASET_VALIDATION.errorCount} blocking validation errors found.`}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Rows" value={DATASET_VALIDATION.rowCount} sub="Prepared dataset" icon={Activity} />
              <StatCard
                title="Warnings"
                value={DATASET_VALIDATION.warningCount}
                sub="Non-blocking checks"
                icon={Flag}
              />
              <StatCard
                title="First date"
                value={DATASET_VALIDATION.minDate ? fmtDate(DATASET_VALIDATION.minDate) : "—"}
                sub="UTC-normalized"
                icon={TrendingUp}
              />
              <StatCard
                title="Last date"
                value={DATASET_VALIDATION.maxDate ? fmtDate(DATASET_VALIDATION.maxDate) : "—"}
                sub="UTC-normalized"
                icon={TrendingUp}
              />
            </div>

            {DATASET_VALIDATION.issues.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {DATASET_VALIDATION.issues.slice(0, 8).map((issue) => (
                  <li key={`${issue.level}-${issue.rowId || issue.message}`}>
                    <span className="font-medium uppercase text-slate-500">{issue.level}</span> {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No validation warnings were raised on the packaged dataset.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5" />
              Smoke tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                TEST_RESULTS.passed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {TEST_RESULTS.passed
                ? `All ${TEST_RESULTS.count} smoke tests passed.`
                : `${TEST_RESULTS.failures.length} of ${TEST_RESULTS.count} smoke tests failed.`}
            </div>
            {!TEST_RESULTS.passed ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {TEST_RESULTS.failures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
