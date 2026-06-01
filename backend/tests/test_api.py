"""Backend API tests for Math of Marketing app"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestDashboard:
    """Dashboard API tests"""

    def test_dashboard_status(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        assert r.status_code == 200

    def test_dashboard_overview_fields(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        data = r.json()
        overview = data["overview"]
        assert overview["total_spend"] == 312000
        assert overview["total_revenue"] == 568000
        assert overview["roas"] == 1.82
        assert overview["cac"] == 467
        assert overview["leads_generated"] == 625
        assert overview["conversion_rate"] == 3.2
        assert overview["pipeline_contribution"] == 2850000

    def test_dashboard_channels(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        data = r.json()
        assert len(data["channels"]) == 6

    def test_dashboard_monthly_trend(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        data = r.json()
        assert len(data["monthly_trend"]) == 6

    def test_dashboard_funnel(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        data = r.json()
        funnel = data["funnel"]
        assert funnel["impressions"] == 4500000
        assert funnel["closed_won"] == 38


class TestRecommendations:
    """Recommendations API tests"""

    def test_recommendations_status(self):
        r = requests.get(f"{BASE_URL}/api/recommendations")
        assert r.status_code == 200

    def test_recommendations_findings(self):
        r = requests.get(f"{BASE_URL}/api/recommendations")
        data = r.json()
        assert len(data["key_findings"]) == 5

    def test_recommendations_actions(self):
        r = requests.get(f"{BASE_URL}/api/recommendations")
        data = r.json()
        assert len(data["recommended_actions"]) == 5

    def test_recommendations_structure(self):
        r = requests.get(f"{BASE_URL}/api/recommendations")
        data = r.json()
        assert "period" in data
        assert data["period"] == "June 2026"


class TestChat:
    """Chat API tests"""

    def test_chat_basic(self):
        r = requests.post(f"{BASE_URL}/api/chat", json={"message": "What is our ROAS?"})
        assert r.status_code == 200
        data = r.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 0

    def test_chat_session_continuity(self):
        r1 = requests.post(f"{BASE_URL}/api/chat", json={"message": "Hello"})
        session_id = r1.json()["session_id"]
        r2 = requests.post(f"{BASE_URL}/api/chat", json={"message": "What was my last message?", "session_id": session_id})
        assert r2.status_code == 200
        assert r2.json()["session_id"] == session_id

    def test_chat_history(self):
        r1 = requests.post(f"{BASE_URL}/api/chat", json={"message": "ROAS trend?"})
        session_id = r1.json()["session_id"]
        r2 = requests.get(f"{BASE_URL}/api/chat/{session_id}/history")
        assert r2.status_code == 200
        history = r2.json()
        assert len(history) >= 2
