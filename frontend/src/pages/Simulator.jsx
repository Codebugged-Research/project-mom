import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Slider } from "../components/ui/slider";
import { RotateCcw, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { CHANNELS, simulateChannels, formatCurrency, formatRoas } from "../data/demoData";

const DEFAULT_ADJUSTMENTS = Object.fromEntries(CHANNELS.map((c) => [c.name, 0]));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#050505] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-[#8B9A92] mb-2 font-body">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: e.fill }}>
          {e.name}: {formatCurrency(e.value)}
        </p>
      ))}
    </div>
  );
};

function DeltaBadge({ current, projected, isHigherBetter = true }) {
  const delta = projected - current;
  const pct = ((delta / current) * 100).toFixed(1);
  const positive = isHigherBetter ? delta >= 0 : delta <= 0;
  const Icon = delta > 0 ? ChevronUp : delta < 0 ? ChevronDown : Minus;
  const color = delta === 0 ? "#525C57" : positive ? "#00FF9C" : "#FF6B6B";

  return (
    <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color }}>
      <Icon className="w-3 h-3" />
      {Math.abs(+pct)}%
    </span>
  );
}

export default function Simulator() {
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS);

  const sim = useMemo(() => simulateChannels(adjustments), [adjustments]);

  const setAdj = (name, val) =>
    setAdjustments((prev) => ({ ...prev, [name]: val }));

  const reset = () => setAdjustments(DEFAULT_ADJUSTMENTS);

  const hasChanges = Object.values(adjustments).some((v) => v !== 0);

  // Chart data
  const spendChartData = sim.channels.map((c) => ({
    name: c.name.replace(" Ads", "").replace("Organic", "Organic"),
    Current: c.spend,
    Projected: c.projected_spend,
  }));

  const revenueChartData = sim.channels.map((c) => ({
    name: c.name.replace(" Ads", ""),
    Current: c.revenue,
    Projected: c.projected_revenue,
  }));

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            What-If Simulator
          </h1>
          <p className="text-sm text-[#8B9A92] font-body mt-1">
            Adjust channel budgets and see projected impact in real-time
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={reset}
            data-testid="simulator-reset-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm font-body text-[#8B9A92] bg-[#0A0D0B] border border-white/5 rounded-lg hover:border-[#00FF9C]/30 hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-heading font-semibold text-white mb-4">
              Budget Adjustments
            </h3>
            <div className="space-y-5">
              {CHANNELS.map((ch) => {
                const adj = adjustments[ch.name];
                const isPos = adj > 0;
                const isNeg = adj < 0;
                const adjColor = isPos ? "#00FF9C" : isNeg ? "#FF6B6B" : "#525C57";
                const testKey = ch.name.toLowerCase().replace(/\s+/g, "-");

                return (
                  <div key={ch.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: ch.color }}
                        />
                        <span className="text-sm text-white font-body">
                          {ch.name}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-body"
                          style={{
                            color: ch.color,
                            background: `${ch.color}15`,
                          }}
                        >
                          {ch.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#525C57] font-mono">
                          {formatCurrency(ch.spend)}
                        </span>
                        <span
                          className="text-xs font-mono font-bold w-12 text-right"
                          style={{ color: adjColor }}
                        >
                          {adj > 0 ? `+${adj}%` : adj < 0 ? `${adj}%` : "0%"}
                        </span>
                      </div>
                    </div>
                    <Slider
                      data-testid={`simulator-slider-${testKey}`}
                      value={[adj]}
                      onValueChange={([val]) => setAdj(ch.name, val)}
                      min={-50}
                      max={100}
                      step={5}
                      className="simulator-slider"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="lg:col-span-3 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Projected Spend",
                current: sim.current.spend,
                projected: sim.projected.spend,
                format: formatCurrency,
                isHigherBetter: false,
                testId: "simulator-projected-spend",
              },
              {
                label: "Projected Revenue",
                current: sim.current.revenue,
                projected: sim.projected.revenue,
                format: formatCurrency,
                isHigherBetter: true,
                testId: "simulator-projected-revenue",
              },
              {
                label: "Projected ROAS",
                current: sim.current.roas,
                projected: sim.projected.roas,
                format: formatRoas,
                isHigherBetter: true,
                testId: "simulator-projected-roas",
              },
              {
                label: "Projected Leads",
                current: sim.current.leads,
                projected: sim.projected.leads,
                format: (v) => Math.round(v).toLocaleString(),
                isHigherBetter: true,
                testId: "simulator-projected-leads",
              },
            ].map((card) => {
              const delta = card.projected - card.current;
              const isImprovement = card.isHigherBetter ? delta >= 0 : delta <= 0;
              return (
                <div
                  key={card.label}
                  data-testid={card.testId}
                  className="bg-[#0A0D0B] border border-white/5 rounded-xl p-3 hover:border-[#00FF9C]/15 transition-all"
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[#525C57] font-body mb-1">
                    {card.label}
                  </div>
                  <div className="text-lg font-mono font-bold text-[#00FF9C]">
                    {card.format(card.projected)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-[#525C57] font-body">
                      Was: {card.format(card.current)}
                    </span>
                    <DeltaBadge
                      current={card.current}
                      projected={card.projected}
                      isHigherBetter={card.isHigherBetter}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          <div
            data-testid="simulator-revenue-chart"
            className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-white">
                Revenue: Current vs Projected
              </h3>
              <div className="flex gap-3 text-xs font-body">
                <span className="flex items-center gap-1 text-[#8B9A92]">
                  <span className="w-2 h-2 bg-white/20 rounded-sm" />
                  Current
                </span>
                <span className="flex items-center gap-1 text-[#8B9A92]">
                  <span className="w-2 h-2 bg-[#00FF9C]/60 rounded-sm" />
                  Projected
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={revenueChartData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#525C57", fontSize: 10, fontFamily: "Manrope" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#525C57", fontSize: 10, fontFamily: "Manrope" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Current" fill="rgba(255,255,255,0.15)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Projected" fill="rgba(0,255,156,0.6)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spend Chart */}
          <div
            data-testid="simulator-spend-chart"
            className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-white">
                Spend: Current vs Projected
              </h3>
              <div className="flex gap-3 text-xs font-body">
                <span className="flex items-center gap-1 text-[#8B9A92]">
                  <span className="w-2 h-2 bg-white/20 rounded-sm" />
                  Current
                </span>
                <span className="flex items-center gap-1 text-[#8B9A92]">
                  <span className="w-2 h-2 bg-[#3B82F6]/60 rounded-sm" />
                  Projected
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={spendChartData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#525C57", fontSize: 10, fontFamily: "Manrope" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#525C57", fontSize: 10, fontFamily: "Manrope" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Current" fill="rgba(255,255,255,0.15)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Projected" fill="rgba(59,130,246,0.6)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
