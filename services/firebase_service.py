import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore

from config import Config

_db = None
_memory_store = []


def _get_firestore_client():
    global _db

    if _db is not None:
        return _db

    try:
        if not firebase_admin._apps:
            credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            if credentials_path:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()

        _db = firestore.client()
        return _db
    except Exception:
        return None


def _sanitize_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _sanitize_analysis(analysis):
    if not isinstance(analysis, dict):
        return {}

    sanitized = {}
    for key, value in analysis.items():
        if isinstance(value, str):
            sanitized[key] = value.strip()
        elif isinstance(value, bool):
            sanitized[key] = value
        elif isinstance(value, list):
            sanitized[key] = [
                item.strip() if isinstance(item, str) else item for item in value
            ]
        else:
            sanitized[key] = value

    return sanitized


def save_analysis_history(user_id, item, analysis):
    user_id = _sanitize_text(user_id)
    item = _sanitize_text(item)
    analysis = _sanitize_analysis(analysis)

    timestamp = datetime.now(timezone.utc).isoformat()
    formatted_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "userId": user_id,
        "item": item,
        "category": analysis.get("category", ""),
        "categoryIcon": analysis.get("category_icon", ""),
        "recyclable": bool(analysis.get("recyclable", False)),
        "hazardous": bool(analysis.get("hazardous", False)),
        "fullResponse": analysis,
        "timestamp": timestamp,
        "formattedDate": formatted_date,
    }

    client = _get_firestore_client()
    if client is not None:
        client.collection("waste_history").add(record)
        return True

    _memory_store.append(record)
    return True


def get_history(user_id, limit=50):
    user_id = _sanitize_text(user_id)
    client = _get_firestore_client()

    if client is not None:
        docs = (
            client.collection("waste_history")
            .where("userId", "==", user_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [doc.to_dict() for doc in docs]

    return [
        record
        for record in reversed(_memory_store)
        if record.get("userId") == user_id
    ][0:limit]


def get_dashboard_data(user_id):
    user_id = _sanitize_text(user_id)
    history = get_history(user_id, limit=200)

    total_scans = len(history)
    recyclable_count = sum(1 for item in history if item.get("recyclable") is True)
    hazardous_count = sum(1 for item in history if item.get("hazardous") is True)
    recycle_percentage = round((recyclable_count / total_scans) * 100, 1) if total_scans else 0.0

    category_counts = {}
    for item in history:
        category = item.get("category") or "Unknown"
        category_counts[category] = category_counts.get(category, 0) + 1

    trend_labels = []
    trend_data = []

    for offset in range(6, -1, -1):
        current_date = datetime.now(timezone.utc).fromtimestamp(
            datetime.now(timezone.utc).timestamp() - (offset * 86400)
        ).strftime("%Y-%m-%d")
        trend_labels.append(current_date)
        trend_data.append(
            sum(1 for item in history if (item.get("timestamp") or "")[:10] == current_date)
        )

    return {
        "totalScans": total_scans,
        "recyclableCount": recyclable_count,
        "hazardousCount": hazardous_count,
        "recyclePercentage": recycle_percentage,
        "categoryCounts": [
            {"label": label, "value": count} for label, count in category_counts.items()
        ],
        "sevenDayTrend": {
            "labels": trend_labels,
            "datasets": [
                {
                    "label": "Scans",
                    "data": trend_data,
                }
            ],
        },
    }
