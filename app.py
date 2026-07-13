from flask import Flask, request, jsonify
from flask_cors import CORS

from services.api_routes import api_blueprint
from services.groq_service import generate_waste_guide

app = Flask(__name__)
CORS(app)
app.register_blueprint(api_blueprint)

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
            "guide": result
        })

    except Exception:
        return jsonify({
            "success": False,
            "error": "Unable to generate waste guide. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)