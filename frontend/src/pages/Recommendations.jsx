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
import { generateAiRecommendations, FALLBACK_RECOMMENDATIONS } from "../lib/openai";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "#FFFFFF", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)", Icon: AlertTriangle },
  high: { label: "High", color: "#CCCCCC", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", Icon: TrendingDown },
  opportunity: { label: "Opportunity", color: "#AAAAAA", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", Icon: Zap },
};

const PRIORITY_CONFIG = {
  P0: { label: "Critical", color: "#FFFFFF", bg: "rgba(255,255,255,0.15)" },
  P1: { label: "High", color: "#CCCCCC", bg: "rgba(255,255,255,0.1)" },
  P2: { label: "Medium", color: "#888888", bg: "rgba(255,255,255,0.05)" },
};

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await generateAiRecommendations();
        setData(res);
      } catch (err) {
        console.warn("Using fallback recommendations:", err);
        setData(FALLBACK_RECOMMENDATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await generateAiRecommendations();
      setData(res);
    } catch (err) {
      console.warn("Using fallback recommendations:", err);
      setData(FALLBACK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
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
            <span className="text-xs font-body uppercase tracking-widest text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
              AI Generated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight mt-2">
            Executive Summary
          </h1>
          <p className="text-sm text-neutral-400 font-body mt-1">
            {data
              ? `Generated ${formatDate(data.generated_at)} · ${data.period}`
              : "Analyzing marketing performance..."}
          </p>
        </div>
        <button
          onClick={refresh}
          data-testid="recommendations-refresh-btn"
          className="flex items-center gap-2 px-4 py-2 text-sm font-body text-neutral-400 bg-[#0A0A0A] border border-white/5 rounded-lg hover:border-white/20 hover:text-white transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-neutral-400 font-body">Generating insights...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Findings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-white" />
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
                  className="bg-[#0A0A0A] border rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    borderColor: cfg.border,
                    background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(10,10,10,0) 100%)`,
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
                        <span className="text-[10px] text-neutral-500 font-body">
                          {finding.channel}
                        </span>
                      </div>
                      <p className="text-sm text-white font-body font-medium leading-snug">
                        {finding.finding}
                      </p>
                      <p className="text-xs text-neutral-400 font-body mt-1">
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
              <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-white" />
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
                  className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5"
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
                      <p className="text-xs text-neutral-400 font-body mb-2">
                        {action.rationale}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <p className="text-xs font-body text-neutral-300">
                          {action.projected_impact}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom summary */}
      {!loading && data && (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-semibold text-white mb-1">
                The Bottom Line
              </h3>
              <p className="text-sm text-neutral-400 font-body leading-relaxed">
                Your marketing spend is growing faster than revenue. The root cause is Meta Ads oversaturation paired with underinvestment in high-ROI channels like Email and Google Search.
                Reallocating 15–20% of Meta budget to Email and Google could recover ROAS from 1.82x to an estimated <span className="text-white font-semibold">2.10–2.25x</span> within 60 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
