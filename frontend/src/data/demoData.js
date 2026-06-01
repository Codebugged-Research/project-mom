export const OVERVIEW = {
  total_spend: 312000,
  total_revenue: 568000,
  roas: 1.82,
  cac: 467,
  leads_generated: 625,
  conversion_rate: 3.2,
  pipeline_contribution: 2850000,
};

export const MONTHLY_TREND = [
  { month: "Jan", spend: 235000, revenue: 480000, roas: 2.04, cac: 392, leads: 580 },
  { month: "Feb", spend: 248000, revenue: 502000, roas: 2.02, cac: 408, leads: 595 },
  { month: "Mar", spend: 267000, revenue: 535000, roas: 2.00, cac: 425, leads: 612 },
  { month: "Apr", spend: 280000, revenue: 547000, roas: 1.95, cac: 438, leads: 598 },
  { month: "May", spend: 295000, revenue: 558000, roas: 1.89, cac: 452, leads: 610 },
  { month: "Jun", spend: 312000, revenue: 568000, roas: 1.82, cac: 467, leads: 625 },
];

export const CHANNELS = [
  {
    name: "Meta Ads",
    spend: 95000,
    revenue: 158000,
    leads: 185,
    cac: 514,
    roas: 1.66,
    efficiency_factor: 0.65,
    color: "#FF6B6B",
    status: "Declining",
  },
  {
    name: "Google Ads",
    spend: 72000,
    revenue: 198000,
    leads: 228,
    cac: 316,
    roas: 2.75,
    efficiency_factor: 1.10,
    color: "#4ECDC4",
    status: "Strong",
  },
  {
    name: "LinkedIn",
    spend: 55000,
    revenue: 112000,
    leads: 65,
    cac: 846,
    roas: 2.04,
    efficiency_factor: 0.85,
    color: "#45B7D1",
    status: "Niche",
  },
  {
    name: "Email",
    spend: 12000,
    revenue: 68000,
    leads: 88,
    cac: 136,
    roas: 5.67,
    efficiency_factor: 1.35,
    color: "#00FF9C",
    status: "Excellent",
  },
  {
    name: "Organic",
    spend: 8000,
    revenue: 25000,
    leads: 42,
    cac: 190,
    roas: 3.13,
    efficiency_factor: 0.75,
    color: "#96CEB4",
    status: "Good",
  },
  {
    name: "Webinar",
    spend: 18000,
    revenue: 32000,
    leads: 12,
    cac: 1500,
    roas: 1.78,
    efficiency_factor: 0.95,
    color: "#FFEAA7",
    status: "Pipeline",
  },
];

export const FUNNEL_STAGES = [
  { stage: "Impressions", value: 4500000, label: "4.5M" },
  { stage: "Clicks", value: 125000, label: "125K" },
  { stage: "Leads", value: 625, label: "625" },
  { stage: "SQLs", value: 280, label: "280" },
  { stage: "Opportunities", value: 145, label: "145" },
  { stage: "Closed Won", value: 38, label: "38" },
];

export function simulateChannels(adjustments) {
  const adjustedChannels = CHANNELS.map((ch) => {
    const adj = adjustments[ch.name] || 0;
    const spendMultiplier = 1 + adj / 100;

    let revenueMultiplier;
    if (adj > 0) {
      revenueMultiplier = 1 + (adj / 100) * ch.efficiency_factor;
    } else {
      revenueMultiplier = 1 + (adj / 100) * 0.9;
    }

    const newSpend = Math.round(ch.spend * spendMultiplier);
    const newRevenue = Math.round(ch.revenue * revenueMultiplier);
    const newLeads = Math.round(ch.leads * (spendMultiplier * 0.85 + 0.15));

    return {
      ...ch,
      projected_spend: newSpend,
      projected_revenue: newRevenue,
      projected_leads: newLeads,
    };
  });

  const currentTotals = {
    spend: CHANNELS.reduce((s, c) => s + c.spend, 0),
    revenue: CHANNELS.reduce((s, c) => s + c.revenue, 0),
    leads: CHANNELS.reduce((s, c) => s + c.leads, 0),
  };
  currentTotals.roas = currentTotals.revenue / currentTotals.spend;

  const projectedTotals = {
    spend: adjustedChannels.reduce((s, c) => s + c.projected_spend, 0),
    revenue: adjustedChannels.reduce((s, c) => s + c.projected_revenue, 0),
    leads: adjustedChannels.reduce((s, c) => s + c.projected_leads, 0),
  };
  projectedTotals.roas =
    projectedTotals.spend > 0
      ? projectedTotals.revenue / projectedTotals.spend
      : 0;

  return {
    channels: adjustedChannels,
    current: currentTotals,
    projected: projectedTotals,
  };
}

export function formatCurrency(val) {
  if (Math.abs(val) >= 1000000)
    return `$${(val / 1000000).toFixed(1)}M`;
  if (Math.abs(val) >= 1000)
    return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

export function formatRoas(val) {
  return `${val.toFixed(2)}x`;
}

export function formatNumber(val) {
  return val.toLocaleString();
}
