from flask import Flask, request, jsonify
from flask_cors import CORS

from services.groq_service import generate_waste_guide

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

    item = data.get("item")

    if not item:
        return jsonify({
            "error": "Waste item is required."
        }), 400

    try:
        result = generate_waste_guide(item)

        return jsonify({
            "item": item,
            "guide": result
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)