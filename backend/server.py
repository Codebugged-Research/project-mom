from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory session store (POC approach)
chat_sessions: dict = {}

DEMO_DATA = {
    "overview": {
        "total_spend": 312000,
        "total_revenue": 568000,
        "roas": 1.82,
        "cac": 499,  # 312000 / 625 = 499.2
        "leads_generated": 625,
        "conversion_rate": 3.2,
        "pipeline_contribution": 2850000
    },
    "monthly_trend": [
        {"month": "Jan", "spend": 235000, "revenue": 480000, "roas": 2.04, "cac": 600, "leads": 392},  # 235000/392
        {"month": "Feb", "spend": 248000, "revenue": 502000, "roas": 2.02, "cac": 577, "leads": 430},  # 248000/430
        {"month": "Mar", "spend": 267000, "revenue": 535000, "roas": 2.00, "cac": 562, "leads": 475},  # 267000/475
        {"month": "Apr", "spend": 280000, "revenue": 547000, "roas": 1.95, "cac": 533, "leads": 525},  # 280000/525
        {"month": "May", "spend": 295000, "revenue": 558000, "roas": 1.89, "cac": 509, "leads": 580},  # 295000/580
        {"month": "Jun", "spend": 312000, "revenue": 568000, "roas": 1.82, "cac": 499, "leads": 625}   # 312000/625
    ],
    "channels": [
        {"channel": "Meta Ads", "spend": 95000, "revenue": 158000, "leads": 185, "cac": 514, "roas": 1.66, "status": "Declining"},
        {"channel": "Google Ads", "spend": 72000, "revenue": 198000, "leads": 228, "cac": 316, "roas": 2.75, "status": "Strong"},
        {"channel": "LinkedIn", "spend": 55000, "revenue": 112000, "leads": 65, "cac": 846, "roas": 2.04, "status": "Niche"},
        {"channel": "Email", "spend": 12000, "revenue": 68000, "leads": 88, "cac": 136, "roas": 5.67, "status": "Excellent"},
        {"channel": "Organic", "spend": 8000, "revenue": 25000, "leads": 42, "cac": 190, "roas": 3.13, "status": "Good"},
        {"channel": "Webinar", "spend": 18000, "revenue": 32000, "leads": 12, "cac": 1500, "roas": 1.78, "status": "Pipeline"}
    ],
    "funnel": {
        "impressions": 4500000,
        "clicks": 125000,
        "leads": 625,
        "sqls": 280,
        "opportunities": 145,
        "closed_won": 38
    }
}

SYSTEM_PROMPT = """You are an expert AI Marketing Analytics Copilot for a CMO-level dashboard called "Math of Marketing — AI Decision Copilot".
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
- Think like a data-driven CMO, not a consultant"""


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


@api_router.get("/dashboard")
async def get_dashboard():
    return DEMO_DATA


@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")

    try:
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=SYSTEM_PROMPT
            ).with_model("openai", "gpt-4o")

        chat_instance = chat_sessions[session_id]
        user_msg = UserMessage(text=request.message)
        response = await chat_instance.send_message(user_msg)

        # Store in MongoDB for display
        now = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_many([
            {"session_id": session_id, "role": "user", "content": request.message, "timestamp": now},
            {"session_id": session_id, "role": "assistant", "content": response, "timestamp": now}
        ])

        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("timestamp", 1).to_list(200)
    return messages


@api_router.get("/recommendations")
async def get_recommendations():
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "period": "June 2026",
        "key_findings": [
            {
                "severity": "critical",
                "finding": "ROAS declined 6 consecutive months: 2.04x → 1.82x",
                "impact": "Revenue growth is not keeping pace with spend increases",
                "channel": "All"
            },
            {
                "severity": "opportunity",
                "finding": "CAC improved 17% in 6 months ($600 → $499) — leads growing faster than spend",
                "impact": "Lead generation efficiency gaining momentum — strong signal to invest further",
                "channel": "All"
            },
            {
                "severity": "high",
                "finding": "Meta Ads: 30% of budget but worst ROAS at 1.66x — declining trend",
                "impact": "~$28K/month in suboptimal spend vs alternative channels",
                "channel": "Meta Ads"
            },
            {
                "severity": "opportunity",
                "finding": "Email delivers 5.67x ROAS — 3x above average — on just $12K/month",
                "impact": "Significant underinvestment in highest-performing channel",
                "channel": "Email"
            },
            {
                "severity": "opportunity",
                "finding": "Google Search: 228 leads at $316 CAC — best volume/efficiency balance",
                "impact": "Scalable channel with proven performance at current spend levels",
                "channel": "Google Ads"
            }
        ],
        "recommended_actions": [
            {
                "priority": "P0",
                "action": "Reduce Meta Ads spend by 15–20%",
                "rationale": "Audience saturation — diminishing returns at $95K/month. Reallocate to higher-ROI channels.",
                "projected_impact": "Save ~$15K–19K/month, minimal revenue impact (<3% loss)"
            },
            {
                "priority": "P0",
                "action": "Increase Email Marketing budget by 50% ($12K → $18K)",
                "rationale": "5.67x ROAS is the highest across all channels — current budget is a fraction of potential.",
                "projected_impact": "+$34K estimated additional revenue at current efficiency"
            },
            {
                "priority": "P1",
                "action": "Scale Google Search by 20% ($72K → $86K)",
                "rationale": "Proven 2.75x ROAS with scalable intent-based audience. Most efficient high-volume channel.",
                "projected_impact": "+45 leads/month, ~$40K incremental revenue"
            },
            {
                "priority": "P1",
                "action": "Build LinkedIn → Email retargeting nurture sequence",
                "rationale": "LinkedIn generates high-quality enterprise leads at 2.04x ROAS but nurture path is weak.",
                "projected_impact": "Estimated 8–12% improvement in SQL conversion rate"
            },
            {
                "priority": "P2",
                "action": "Increase Webinar frequency to 2x per month",
                "rationale": "Webinar pipeline contribution (3x direct revenue) demonstrates strong enterprise enablement value.",
                "projected_impact": "Pipeline growth estimated at $400K–600K over next quarter"
            }
        ]
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
