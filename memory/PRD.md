# Math of Marketing – AI Decision Copilot

## Problem Statement
Build a lightweight POC web app called "Math of Marketing – AI Decision Copilot" — an AI-powered marketing analytics assistant helping CMOs understand what is working, what is not, and what to do next using marketing data.

## Architecture

### Tech Stack
- **Frontend**: React 19, Recharts, Radix UI Sliders, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, Motor (MongoDB), emergentintegrations (GPT-4o)
- **Database**: MongoDB (chat history storage)
- **LLM**: GPT-4o via EMERGENT_LLM_KEY

### Pages & Routes
- `/` — Dashboard (KPI cards + 5 charts)
- `/copilot` — AI Marketing Copilot (chat)
- `/recommendations` — Executive Summary + Recommended Actions
- `/simulator` — What-If Budget Simulator

### Backend Endpoints
- `GET /api/dashboard` — Returns all demo marketing data
- `POST /api/chat` — AI chat with GPT-4o marketing context
- `GET /api/chat/{session_id}/history` — Load previous chat history
- `GET /api/recommendations` — Auto-generated executive recommendations

## What's Been Implemented (June 1, 2026)

### Dashboard
- 7 KPI metric cards: Total Spend, Revenue, ROAS, CAC, Leads, Conversion Rate, Pipeline
- Spend vs Revenue Area Chart (6-month trend)
- Channel ROAS horizontal bars (sorted by performance)
- CAC Trend Line Chart (showing 19% increase)
- Channel Performance Bar Chart (Spend vs Revenue per channel)
- Lead Funnel visualization (Impressions → Clicks → Leads → SQLs → Opps → Closed Won)

### AI Marketing Copilot
- Real GPT-4o via emergentintegrations library
- Full marketing data context in system prompt (6 channels, 6-month trends, key issues)
- 5 suggested question chips on empty state
- Chat history persisted in MongoDB + displayed on page reload
- Session management via localStorage UUID

### Recommendation Engine
- Auto-generated executive summary from backend
- 5 Key Findings with severity levels (Critical, High, Opportunity)
- 5 Recommended Actions with priority (P0/P1/P2) and projected impact
- "Bottom Line" summary with ROAS recovery estimate

### What-If Simulator
- 6 channel sliders (-50% to +100% adjustment range)
- Real-time calculation using efficiency factors per channel
- 4 summary cards: Projected Spend, Revenue, ROAS, Leads
- 2 real-time charts: Revenue (Current vs Projected), Spend (Current vs Projected)
- Channel status badges (Declining, Strong, Excellent, etc.)

## Demo Data
- 6 Channels: Meta Ads (declining), Google Ads (strong), LinkedIn (niche), Email (excellent), Organic, Webinar
- 6-month trend showing ROAS decline: 2.04x → 1.82x
- CAC increase: $392 → $467 (+19%)
- Key narrative: Meta oversaturated, Email underinvested, Google scales well

## Design
- Theme: Dark (#050505 bg, #0A0D0B surface, #00FF9C neon green)
- Fonts: Outfit (headings), Manrope (body), Space Mono (metrics)
- Reference: EventGPT-style dark terminal dashboard

## Prioritized Backlog

### P0 (Next Sprint)
- [ ] Add date range selector (filter by time period)
- [ ] Export recommendations as PDF/CSV

### P1
- [ ] Real data integration (Google Ads API, Meta Ads API)
- [ ] User authentication for multi-tenant CMO access
- [ ] Email report scheduling

### P2
- [ ] Multi-company comparison view
- [ ] Budget forecasting with historical ML
- [ ] Slack/Teams notification integration for weekly digests
