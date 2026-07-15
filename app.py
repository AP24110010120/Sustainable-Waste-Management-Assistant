from flask import Flask, request, jsonify
from flask_cors import CORS

from services.groq_service import generate_waste_guide
from services.firestore_service import (
    fetch_user_history,
    fetch_centers,
    compute_dashboard_data,
    get_demo_history,
    get_demo_centers,
    get_demo_dashboard,
    is_firestore_available
)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to Sustainable Waste Management Assistant API"
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "Backend is running successfully"
    })

@app.route("/scan", methods=["POST"])
def scan_waste():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is missing."
        }), 400

    item = data.get("item", "").strip()

    if not item:
        return jsonify({
            "error": "Please enter a waste item."
        }), 400

    if len(item) > 100:
        return jsonify({
            "error": "Waste item name is too long."
        }), 400

    try:
        result = generate_waste_guide(item)

        return jsonify({
            "success": True,
            "item": item,
            "analysis": result
        })

    except Exception:
        return jsonify({
            "success": False,
            "error": "Unable to generate waste guide. Please try again."
        }), 500


@app.route("/api/get-history", methods=["GET"])
def get_history():
    user_id = request.args.get('userId')
    history = []

    if is_firestore_available() and user_id:
        history = fetch_user_history(user_id)

    if not history:
        history = get_demo_history()

    return jsonify({
        'success': True,
        'history': history
    })


@app.route("/api/get-centers", methods=["GET"])
def get_centers():
    centers = []

    if is_firestore_available():
        centers = fetch_centers()

    if not centers:
        centers = get_demo_centers()

    return jsonify({
        'success': True,
        'centers': centers
    })


@app.route("/api/dashboard-data", methods=["GET"])
def get_dashboard_data():
    user_id = request.args.get('userId')
    dashboard_data = {}

    if is_firestore_available() and user_id:
        history = fetch_user_history(user_id)
        dashboard_data = compute_dashboard_data(history)

    if not dashboard_data:
        dashboard_data = get_demo_dashboard()

    return jsonify({
        'success': True,
        'data': dashboard_data
    })


if __name__ == "__main__":
    app.run(debug=True)