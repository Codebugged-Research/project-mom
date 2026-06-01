import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  TrendingDown,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Info,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.2)", Icon: AlertTriangle },
  high: { label: "High", color: "#FFEAA7", bg: "rgba(255,234,167,0.1)", border: "rgba(255,234,167,0.2)", Icon: TrendingDown },
  opportunity: { label: "Opportunity", color: "#00FF9C", bg: "rgba(0,255,156,0.1)", border: "rgba(0,255,156,0.2)", Icon: Zap },
};

const PRIORITY_CONFIG = {
  P0: { label: "Critical", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
  P1: { label: "High", color: "#FFEAA7", bg: "rgba(255,234,167,0.1)" },
  P2: { label: "Medium", color: "#4ECDC4", bg: "rgba(78,205,196,0.1)" },
};

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/recommendations`)
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    axios
      .get(`${API}/recommendations`)
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-body uppercase tracking-widest text-[#00FF9C] bg-[#00FF9C]/10 border border-[#00FF9C]/20 px-2.5 py-1 rounded-full">
              AI Generated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight mt-2">
            Executive Summary
          </h1>
          <p className="text-sm text-[#8B9A92] font-body mt-1">
            {data
              ? `Generated ${formatDate(data.generated_at)} · ${data.period}`
              : "Analyzing marketing performance..."}
          </p>
        </div>
        <button
          onClick={refresh}
          data-testid="recommendations-refresh-btn"
          className="flex items-center gap-2 px-4 py-2 text-sm font-body text-[#8B9A92] bg-[#0A0D0B] border border-white/5 rounded-lg hover:border-[#00FF9C]/30 hover:text-white transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#00FF9C]/30 border-t-[#00FF9C] rounded-full animate-spin" />
            <p className="text-sm text-[#8B9A92] font-body">Generating insights...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Findings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#FF6B6B]/10 rounded-md flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-white">
                Key Findings
              </h2>
            </div>

            {data?.key_findings?.map((finding, i) => {
              const cfg = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.opportunity;
              const { Icon } = cfg;
              return (
                <div
                  key={i}
                  data-testid={`finding-${i}`}
                  className="bg-[#0A0D0B] border rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    borderColor: cfg.border,
                    background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(10,13,11,0) 100%)`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: cfg.bg }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] uppercase tracking-[0.12em] font-body px-1.5 py-0.5 rounded"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-[#525C57] font-body">
                          {finding.channel}
                        </span>
                      </div>
                      <p className="text-sm text-white font-body font-medium leading-snug">
                        {finding.finding}
                      </p>
                      <p className="text-xs text-[#8B9A92] font-body mt-1">
                        {finding.impact}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#00FF9C]/10 rounded-md flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-[#00FF9C]" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-white">
                Recommended Actions
              </h2>
            </div>

            {data?.recommended_actions?.map((action, i) => {
              const cfg = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.P2;
              return (
                <div
                  key={i}
                  data-testid={`action-${i}`}
                  className="bg-[#0A0D0B] border border-white/5 rounded-xl p-4 hover:border-[#00FF9C]/15 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="px-2 py-1 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {action.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-body font-medium leading-snug mb-1.5">
                        {action.action}
                      </p>
                      <p className="text-xs text-[#8B9A92] font-body mb-2">
                        {action.rationale}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#00FF9C]" />
                        <p className="text-xs font-body text-[#00FF9C]">
                          {action.projected_impact}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#525C57] flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom summary */}
      {!loading && data && (
        <div className="bg-[#0A0D0B] border border-[#00FF9C]/10 rounded-xl p-5 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#00FF9C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[#00FF9C]" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-semibold text-white mb-1">
                The Bottom Line
              </h3>
              <p className="text-sm text-[#8B9A92] font-body leading-relaxed">
                Your marketing spend is growing faster than revenue. The root cause is Meta Ads oversaturation paired with underinvestment in high-ROI channels like Email and Google Search.
                Reallocating 15–20% of Meta budget to Email and Google could recover ROAS from 1.82x to an estimated <span className="text-[#00FF9C]">2.10–2.25x</span> within 60 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
