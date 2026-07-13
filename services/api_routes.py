import json
import re
from flask import Blueprint, jsonify, request

from services.collection_centers import get_collection_centers
from services.firebase_service import (
    get_dashboard_data,
    get_history,
    save_analysis_history,
)
from services.groq_service import analyze_waste_json

api_blueprint = Blueprint("api_blueprint", __name__, url_prefix="/api")


def _error(message, status_code=400):
    return jsonify({"error": message}), status_code


def _sanitize_string(value):
    if value is None:
        return ""
    if not isinstance(value, str):
        return ""
    return value.strip()


def _extract_json_text(text):
    if not text:
        return ""
    cleaned = text.strip()
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


@api_blueprint.route("/analyze-waste", methods=["POST"])
def analyze_waste():
    if not request.is_json:
        return _error("Request body must be JSON.")

    data = request.get_json(silent=True) or {}
    item = _sanitize_string(data.get("item"))

    if not item:
        return _error("Item is required.")

    if len(item) > 100:
        return _error("Item is too long.")

    result = analyze_waste_json(item)

    return jsonify({
        "success": True,
        "item": item,
        "analysis": result,
    })


@api_blueprint.route("/save-history", methods=["POST"])
def save_history():
    if not request.is_json:
        return _error("Request body must be JSON.")

    data = request.get_json(silent=True) or {}
    user_id = _sanitize_string(data.get("userId"))
    item = _sanitize_string(data.get("item"))
    analysis = data.get("analysis")

    if not user_id:
        return _error("userId is required.")

    if not item:
        return _error("item is required.")

    if not isinstance(analysis, dict):
        return _error("analysis must be an object.")

    if not analysis:
        return _error("analysis is required.")

    save_analysis_history(user_id, item, analysis)

    return jsonify({"success": True})


@api_blueprint.route("/get-history", methods=["GET"])
def get_history_route():
    user_id = _sanitize_string(request.args.get("userId", ""))

    if not user_id:
        return _error("userId is required.")

    return jsonify({"success": True, "history": get_history(user_id, limit=50)})


@api_blueprint.route("/dashboard-data", methods=["GET"])
def dashboard_data():
    user_id = _sanitize_string(request.args.get("userId", ""))

    if not user_id:
        return _error("userId is required.")

    return jsonify({"success": True, "data": get_dashboard_data(user_id)})


@api_blueprint.route("/get-centers", methods=["GET"])
def get_centers():
    waste_type = _sanitize_string(request.args.get("type", ""))
    centers = get_collection_centers(waste_type)
    return jsonify({"success": True, "centers": centers})
