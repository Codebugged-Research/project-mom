import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Percent,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { MONTHLY_TREND, CHANNELS, FUNNEL_STAGES, OVERVIEW, formatCurrency } from "../data/demoData";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#050505] border border-white/10 rounded-lg p-3 shadow-xl min-w-[140px]">
      <p className="text-xs text-[#8B9A92] mb-2 font-body">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.value > 1000
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const KPI_CONFIG = [
  { key: "total_spend", label: "Total Spend", icon: DollarSign, format: (v) => formatCurrency(v), change: "+$77K vs Jan", isGood: false },
  { key: "total_revenue", label: "Revenue", icon: TrendingUp, format: (v) => formatCurrency(v), change: "+$88K vs Jan", isGood: true },
  { key: "roas", label: "ROAS", icon: TrendingDown, format: (v) => `${v.toFixed(2)}x`, change: "-0.22x vs Jan", isGood: false },
  { key: "cac", label: "CAC", icon: Users, format: (v) => `$${v}`, change: "+$75 vs Jan", isGood: false },
  { key: "leads_generated", label: "Leads Generated", icon: Target, format: (v) => v.toLocaleString(), change: "+45 vs Jan", isGood: true },
  { key: "conversion_rate", label: "Conversion Rate", icon: Percent, format: (v) => `${v}%`, change: "+0.1% vs Jan", isGood: true },
  { key: "pipeline_contribution", label: "Pipeline", icon: Building2, format: (v) => formatCurrency(v), change: "+$250K vs Jan", isGood: true },
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/dashboard`).then((r) => setData(r.data)).catch(console.error);
  }, []);

  const overview = data?.overview || OVERVIEW;
  const monthlyTrend = data?.monthly_trend || MONTHLY_TREND;
  const channels = data?.channels || CHANNELS;

  const funnelMax = FUNNEL_STAGES[0].value;

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Marketing Command Center
          </h1>
          <p className="text-sm text-[#8B9A92] font-body mt-1">
            June 2026 · TechCorp · All Channels
          </p>
        </div>
        <span className="text-xs font-body uppercase tracking-widest text-[#00FF9C] bg-[#00FF9C]/10 border border-[#00FF9C]/20 px-3 py-1.5 rounded-full">
          Live Demo
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {KPI_CONFIG.map((cfg) => (
          <div
            key={cfg.key}
            data-testid={`metric-${cfg.key.replace(/_/g, "-")}`}
            className="bg-[#0A0D0B] border border-white/5 rounded-xl p-4 hover:border-[#00FF9C]/20 hover:shadow-[0_4px_20px_rgba(0,255,156,0.05)] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 bg-[#00FF9C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00FF9C]/15 transition-colors">
                <cfg.icon className="w-3.5 h-3.5 text-[#00FF9C]" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-mono ${cfg.isGood ? "text-[#00FF9C]" : "text-[#FF6B6B]"}`}>
                {cfg.isGood ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{cfg.change.split(" ")[0]}</span>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00FF9C] mb-1 tracking-tight">
              {cfg.format(overview[cfg.key])}
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#525C57] font-body">
              {cfg.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Spend vs Revenue + Channel ROAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend vs Revenue (2/3 width) */}
        <div
          data-testid="chart-spend-revenue"
          className="lg:col-span-2 bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-heading font-semibold text-white">
                Spend vs Revenue
              </h3>
              <p className="text-xs text-[#8B9A92] font-body mt-0.5">
                6-month performance trend
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-body">
              <span className="flex items-center gap-1.5 text-[#8B9A92]">
                <span className="w-3 h-0.5 bg-[#3B82F6] inline-block rounded" />
                Spend
              </span>
              <span className="flex items-center gap-1.5 text-[#8B9A92]">
                <span className="w-3 h-0.5 bg-[#00FF9C] inline-block rounded" />
                Revenue
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF9C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#525C57", fontSize: 11, fontFamily: "Manrope" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#525C57", fontSize: 11, fontFamily: "Manrope" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spend" name="Spend" stroke="#3B82F6" strokeWidth={2} fill="url(#spendGrad)" dot={false} activeDot={{ r: 4, fill: "#3B82F6" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#00FF9C" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#00FF9C" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel ROAS Horizontal Bar (1/3 width) */}
        <div
          data-testid="chart-channel-roas"
          className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
        >
          <div className="mb-4">
            <h3 className="text-base font-heading font-semibold text-white">
              Channel ROAS
            </h3>
            <p className="text-xs text-[#8B9A92] font-body mt-0.5">
              Return on ad spend by channel
            </p>
          </div>
          <div className="space-y-3">
            {[...channels]
              .sort((a, b) => b.roas - a.roas)
              .map((ch) => {
                const pct = (ch.roas / 6) * 100;
                const color =
                  ch.roas >= 3.5
                    ? "#00FF9C"
                    : ch.roas >= 2.5
                    ? "#4ECDC4"
                    : ch.roas >= 2.0
                    ? "#FFEAA7"
                    : "#FF6B6B";
                return (
                  <div key={ch.channel}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#8B9A92] font-body">
                        {ch.channel}
                      </span>
                      <span className="text-xs font-mono" style={{ color }}>
                        {ch.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Charts Row 2: CAC Trend + Channel Performance + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CAC Trend */}
        <div
          data-testid="chart-cac-trend"
          className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
        >
          <div className="mb-4">
            <h3 className="text-base font-heading font-semibold text-white">
              CAC Trend
            </h3>
            <p className="text-xs text-[#8B9A92] font-body mt-0.5">
              Cost per acquisition — rising concern
            </p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#525C57", fontSize: 11, fontFamily: "Manrope" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#525C57", fontSize: 11, fontFamily: "Manrope" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={[350, 500]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cac" name="CAC" stroke="#FF6B6B" strokeWidth={2.5} dot={{ fill: "#FF6B6B", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Spend vs Revenue Bar */}
        <div
          data-testid="chart-channel-performance"
          className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-heading font-semibold text-white">
                Channel Performance
              </h3>
              <p className="text-xs text-[#8B9A92] font-body mt-0.5">
                Spend vs Revenue
              </p>
            </div>
            <div className="flex gap-3 text-xs font-body">
              <span className="flex items-center gap-1 text-[#8B9A92]">
                <span className="w-2 h-2 bg-[#3B82F6]/60 rounded-sm" />
                Spend
              </span>
              <span className="flex items-center gap-1 text-[#8B9A92]">
                <span className="w-2 h-2 bg-[#00FF9C]/60 rounded-sm" />
                Revenue
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channels} margin={{ top: 0, right: 5, left: 0, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="channel" tick={{ fill: "#525C57", fontSize: 9, fontFamily: "Manrope" }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: "#525C57", fontSize: 10, fontFamily: "Manrope" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" name="Spend" fill="#3B82F6" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#00FF9C" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Funnel */}
        <div
          data-testid="chart-lead-funnel"
          className="bg-[#0A0D0B] border border-white/5 rounded-xl p-5"
        >
          <div className="mb-4">
            <h3 className="text-base font-heading font-semibold text-white">
              Lead Funnel
            </h3>
            <p className="text-xs text-[#8B9A92] font-body mt-0.5">
              Conversion flow
            </p>
          </div>
          <div className="space-y-2">
            {FUNNEL_STAGES.map((stage, i) => {
              const pct = (stage.value / funnelMax) * 100;
              const opacity = 1 - i * 0.12;
              return (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#525C57] font-body">
                      {stage.stage}
                    </span>
                    <span className="text-xs font-mono text-[#8B9A92]">
                      {stage.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(pct, 1)}%`,
                        background: `rgba(0, 255, 156, ${opacity})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#525C57] font-body">
                Win Rate
              </span>
              <span className="text-xs font-mono text-[#00FF9C]">
                {((38 / 625) * 100).toFixed(1)}% overall
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
