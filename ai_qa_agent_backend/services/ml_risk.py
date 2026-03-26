import logging
from typing import List
from models.domain import PullRequest, RiskReport
from services.llm_service import analyze_pr_with_llm
from db.mongodb import get_database

logger = logging.getLogger(__name__)

async def analyze_pr_risk(pr: PullRequest) -> RiskReport:
    """
    Hybrid AI + Heuristic Risk Engine.
    Combines deep heuristic logic with ML context parsing and historical defect learning.
    """
    db = get_database()
    try:
        logger.info(f"Analyzing risk for PR #{pr.pr_number}")
        
        # Base Score (0-100)
        score = 0.0
        impacted_components: List[str] = []
        predicted_issues: List[str] = []
        mitigation_suggestions: List[str] = []
        insights: List[str] = []
        
        security_risk = False
        performance_risk = False
        
        # 1. Heuristic: Lines of Code
        if pr.lines_added > 100:
            score += 3.0
            insights.append(f"PR adds {pr.lines_added} lines, increasing regression risks.")
            
        # 2. Heuristic: File Extensions & Keywords
        for file in pr.changed_files:
            file_lower = file.lower()
            if file_lower.endswith(".env"):
                score += 6.0
                security_risk = True
                impacted_components.append("Configuration")
                predicted_issues.append("Risk of misconfigured environment variables.")
                insights.append(f"Sensitive configuration file changed: {file}")
            
            if "auth" in file_lower:
                score += 5.0
                security_risk = True
                impacted_components.append("Authentication")
                insights.append(f"Authentication logic modified in: {file}")
                
            if "payment" in file_lower or "billing" in file_lower:
                score += 15.0
                impacted_components.append("Payments")
                insights.append(f"Critical payment module affected: {file}")
            elif "security" in file_lower:
                score += 10.0
                security_risk = True
                impacted_components.append("Authentication")
            elif "db" in file_lower or "model" in file_lower:
                score += 5.0
                performance_risk = True
                impacted_components.append("Database")

        # 3. Hybrid AI Understanding
        llm_context = await analyze_pr_with_llm(pr)
        if llm_context.get("is_authentication_change"):
            score += 15.0
            security_risk = True
            impacted_components.append("Authentication")
            insights.append("AI determined root intent relates to core security limits.")
        if llm_context.get("is_payment_change"):
            score += 15.0
            impacted_components.append("Payments")
            
        for insight in llm_context.get("insights", []):
            if insight not in insights:
                insights.append(insight)

        # 4. TRUE Self-Learning System (Frequency-based learning from past defects)
        # Search db.defect_history for modules matching the impacted components
        unique_components = list(set(impacted_components))
        for comp in unique_components:
            defect_count = await db.defect_history.count_documents({"component": {"$regex": comp, "$options": "i"}})
            if defect_count > 2:
                # Frequency based penalty
                penalty = min(defect_count * 2.0, 15.0)
                score += penalty
                insights.append(f"Historical learning: {comp} has a high failure rate ({defect_count} previous defects). Risk increased by {penalty:.1f} points.")
                mitigation_suggestions.append(f"Devote extra QA to {comp} based on historical instability.")
        
        # Final Score boundaries
        score = min(round(score, 1), 100.0)
        
        if score >= 75:
            risk_level = "Critical"
        elif score >= 50:
            risk_level = "High"
        elif score >= 25:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        if not impacted_components:
            impacted_components.append("General Front/Back-end")
            
        return RiskReport(
            related_pr_id=pr.id,
            risk_score=score,
            risk_level=risk_level,
            impacted_components=list(set(impacted_components)),
            predicted_issues=list(set(predicted_issues)),
            mitigation_suggestions=list(set(mitigation_suggestions)),
            security_risk=security_risk,
            performance_risk=performance_risk,
            insights=insights
        )
    except Exception as e:
        logger.error(f"Error analyzing risk for PR: {str(e)}")
        return RiskReport(
            related_pr_id=pr.id,
            risk_score=0.0,
            risk_level="Unknown",
            impacted_components=["Unknown"],
            predicted_issues=["Error generating risk report"],
            mitigation_suggestions=["Manual verification required"],
            insights=["Risk logic failed."]
        )
