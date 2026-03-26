from fastapi import APIRouter, Depends
from db.mongodb import get_database
from api.dependencies import get_current_user

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(current_user = Depends(get_current_user)):
    db = get_database()
    
    total_tests = await db.test_cases.count_documents({})
    number_of_defects = await db.defect_history.count_documents({})
    total_prs = await db.pull_requests.count_documents({})
    
    # Risk Distribution
    risk_distribution = {
        "Critical": await db.risk_reports.count_documents({"risk_level": "Critical"}),
        "High": await db.risk_reports.count_documents({"risk_level": "High"}),
        "Medium": await db.risk_reports.count_documents({"risk_level": "Medium"}),
        "Low": await db.risk_reports.count_documents({"risk_level": "Low"})
    }
    
    high_risk_pr_count = risk_distribution["Critical"] + risk_distribution["High"]
    
    # Generate Insights dynamically
    insights = []
    
    # Defect Insights
    if number_of_defects > 10:
        insights.append(f"High historical defect volume ({number_of_defects} defects). Stricter gating recommended.")
        
    auth_defects = await db.defect_history.count_documents({"component": {"$regex": "auth", "$options": "i"}})
    if auth_defects > 0:
        insights.append(f"Authentication module is a high-risk area ({auth_defects} previous defects detected).")
        
    payment_defects = await db.defect_history.count_documents({"component": {"$regex": "payment|billing", "$options": "i"}})
    if payment_defects > 0:
        insights.append(f"Payment module shows instability ({payment_defects} defects). Deep regression testing advised.")
        
    if risk_distribution["Critical"] > 0:
        insights.append("Critical PR risks detected recently. Immediate automated security testing required.")
        
    if not insights:
        insights.append("System stability is nominal. No immediate structural risks detected.")
        
    return {
        "metrics": {
            "total_test_cases_generated": total_tests,
            "number_of_defects": number_of_defects,
            "high_risk_pr_count": high_risk_pr_count,
            "total_prs_analyzed": total_prs,
            "risk_distribution": risk_distribution,
            "insights": insights
        }
    }
