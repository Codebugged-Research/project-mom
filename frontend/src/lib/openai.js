import axios from "axios";
import { DEMO_DATA, OVERVIEW, MONTHLY_TREND, CHANNELS, FUNNEL_STAGES } from "../data/demoData";

const SYSTEM_PROMPT = `You are an expert AI Marketing Analytics Copilot for a CMO-level dashboard called "Math of Marketing — AI Decision Copilot".
Your job is to analyze marketing performance data and provide clear, actionable business recommendations.

CURRENT MARKETING DATA (June 2026 — TechCorp):

OVERVIEW METRICS:
- Total Monthly Spend: $312,000
- Total Monthly Revenue: $568,000
- ROAS: 1.82x (declining from 2.04x in January — 6-month downtrend)
- Customer Acquisition Cost (CAC): $499 (DOWN 17% from $600 in January — leads growing faster than spend — IMPROVING)
- Monthly Leads: 625
- Conversion Rate: 3.2%
- Pipeline Contribution: $2.85M

6-MONTH TREND (Jan→Jun 2026):
Jan: Spend $235K | Revenue $480K | ROAS 2.04 | CAC $600 | Leads 392
Feb: Spend $248K | Revenue $502K | ROAS 2.02 | CAC $577 | Leads 430
Mar: Spend $267K | Revenue $535K | ROAS 2.00 | CAC $562 | Leads 475
Apr: Spend $280K | Revenue $547K | ROAS 1.95 | CAC $533 | Leads 525
May: Spend $295K | Revenue $558K | ROAS 1.89 | CAC $509 | Leads 580
Jun: Spend $312K | Revenue $568K | ROAS 1.82 | CAC $499 | Leads 625

CHANNEL PERFORMANCE (Current Month):
Meta Ads:   $95K spend | $158K revenue | 185 leads | ROAS 1.66x | CAC $514 | STATUS: DECLINING
Google Ads: $72K spend | $198K revenue | 228 leads | ROAS 2.75x | CAC $316 | STATUS: STRONG PERFORMER
LinkedIn:   $55K spend | $112K revenue |  65 leads | ROAS 2.04x | CAC $846 | STATUS: HIGH QUALITY / NICHE
Email:      $12K spend |  $68K revenue |  88 leads | ROAS 5.67x | CAC $136 | STATUS: EXCELLENT ROI
Organic:     $8K spend |  $25K revenue |  42 leads | ROAS 3.13x | CAC $190 | STATUS: GOOD
Webinar:    $18K spend |  $32K revenue |  12 leads | ROAS 1.78x | CAC $1500 | STATUS: STRONG PIPELINE

CONVERSION FUNNEL:
Impressions: 4,500,000 → Clicks: 125,000 → Leads: 625 → SQLs: 280 → Opportunities: 145 → Closed Won: 38

KEY ISSUES:
1. ROAS declined every month for 6 straight months (2.04 → 1.82)
2. CAC improved 17% ($600 → $499) — leads growing faster than spend, positive efficiency signal
3. Meta Ads: Highest spend ($95K, 30% of budget) but worst ROAS (1.66x) — audience saturation
4. Email: Best ROAS (5.67x) but only $12K budget (3.8%) — massively underallocated
5. Google Search: Best volume+efficiency balance — scalable with more budget
6. LinkedIn: Expensive per lead ($846 CAC) but delivers high-intent enterprise deals

RESPONSE STYLE:
- Be direct, executive-level, and data-driven
- Lead with the most critical insight
- Include specific dollar amounts and percentages
- 3-5 bullet points or 2-3 focused paragraphs max
- End with one concrete recommendation
- Think like a data-driven CMO, not a consultant`;

export function getOpenAiKey() {
  return localStorage.getItem("openai_api_key") || process.env.REACT_APP_OPENAI_API_KEY || "";
}

export function setOpenAiKey(key) {
  if (key) {
    localStorage.setItem("openai_api_key", key);
  } else {
    localStorage.removeItem("openai_api_key");
  }
}

export async function generateAiChatCompletion(chatMessages) {
  const key = getOpenAiKey();
  if (!key) {
    throw new Error("API_KEY_MISSING");
  }

  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...chatMessages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: formattedMessages,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

export async function generateAiRecommendations() {
  const key = getOpenAiKey();
  if (!key) {
    throw new Error("API_KEY_MISSING");
  }

  const prompt = `You are an expert AI Marketing Analytics Director. Analyze the following current marketing performance data for June 2026 (TechCorp) and generate highly actionable key findings and recommended actions in JSON format.

DATA:
${JSON.stringify({ OVERVIEW, MONTHLY_TREND, CHANNELS, FUNNEL_STAGES })}

Your response must be a valid JSON object matching the following structure:
{
  "period": "June 2026",
  "key_findings": [
    {
      "severity": "critical" | "high" | "opportunity",
      "finding": "Specific data-driven finding description with exact metrics (e.g. 'ROAS declined 6 consecutive months: 2.04x to 1.82x')",
      "impact": "What is the direct impact of this finding",
      "channel": "Channel name or 'All'"
    }
  ],
  "recommended_actions": [
    {
      "priority": "P0" | "P1" | "P2",
      "action": "Clear, direct recommended action (e.g. 'Reduce Meta Ads spend by 15-20%')",
      "rationale": "A concise reason justifying this action",
      "projected_impact": "Estimated or projected business impact"
    }
  ]
}

Rules:
- Identify critical issues like the 6-month ROAS downtrend.
- Identify opportunities like Email Ads' very high ROAS but under-allocation.
- Identify CAC improvements as a strong positive signal.
- Keep the findings and actions concise, data-driven, and highly relevant.
- The keys in your JSON output must exactly match the keys above.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a data-driven Chief Growth Officer. You only respond with a raw JSON object matching the requested structure." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = JSON.parse(response.data.choices[0].message.content);
  result.generated_at = new Date().toISOString();
  return result;
}

export const FALLBACK_RECOMMENDATIONS = {
  generated_at: new Date().toISOString(),
  period: "June 2026",
  key_findings: [
    {
      severity: "critical",
      finding: "ROAS declined 6 consecutive months: 2.04x → 1.82x",
      impact: "Revenue growth is not keeping pace with spend increases",
      channel: "All"
    },
    {
      severity: "opportunity",
      finding: "CAC improved 17% in 6 months ($600 → $499) — leads growing faster than spend",
      impact: "Lead generation efficiency gaining momentum — strong signal to invest further",
      channel: "All"
    },
    {
      severity: "high",
      finding: "Meta Ads: 30% of budget but worst ROAS at 1.66x — declining trend",
      impact: "~$28K/month in suboptimal spend vs alternative channels",
      channel: "Meta Ads"
    },
    {
      severity: "opportunity",
      finding: "Email delivers 5.67x ROAS — 3x above average — on just $12K/month",
      impact: "Significant underinvestment in highest-performing channel",
      channel: "Email"
    },
    {
      severity: "opportunity",
      finding: "Google Search: 228 leads at $316 CAC — best volume/efficiency balance",
      impact: "Scalable channel with proven performance at current spend levels",
      channel: "Google Ads"
    }
  ],
  recommended_actions: [
    {
      priority: "P0",
      action: "Reduce Meta Ads spend by 15–20%",
      rationale: "Audience saturation — diminishing returns at $95K/month. Reallocate to higher-ROI channels.",
      projected_impact: "Save ~$15K–19K/month, minimal revenue impact (<3% loss)"
    },
    {
      priority: "P0",
      action: "Increase Email Marketing budget by 50% ($12K → $18K)",
      rationale: "5.67x ROAS is the highest across all channels — current budget is a fraction of potential.",
      projected_impact: "+$34K estimated additional revenue at current efficiency"
    },
    {
      priority: "P1",
      action: "Scale Google Search by 20% ($72K → $86K)",
      rationale: "Proven 2.75x ROAS with scalable intent-based audience. Most efficient high-volume channel.",
      projected_impact: "+45 leads/month, ~$40K incremental revenue"
    },
    {
      priority: "P1",
      action: "Build LinkedIn → Email retargeting nurture sequence",
      rationale: "LinkedIn generates high-quality enterprise leads at 2.04x ROAS but nurture path is weak.",
      projected_impact: "Estimated 8–12% improvement in SQL conversion rate"
    },
    {
      priority: "P2",
      action: "Increase Webinar frequency to 2x per month",
      rationale: "Webinar pipeline contribution (3x direct revenue) demonstrates strong enterprise enablement value.",
      projected_impact: "Pipeline growth estimated at $400K–600K over next quarter"
    }
  ]
};
