from unittest import result

from config import Config
from config import Config
import json

try:
    from groq import Groq
except ImportError:
    Groq = None

client = None
if Config.GROQ_API_KEY and Groq is not None:
    try:
        client = Groq(api_key=Config.GROQ_API_KEY)
    except Exception:
        client = None


def _mock_waste_guide(item):
    return {
        "category": "General Waste",
        "category_icon": "♻️",
        "recyclable": False,
        "hazardous": False,
        "hazard_warning": "",
        "disposal_instructions": f"Dispose of '{item}' in regular trash or in recycling if accepted locally. Clean and separate recyclable portions first.",
        "recycling_steps": [
            "Check local recycling rules",
            "Clean and dry recyclable parts",
            "Separate materials by type"
        ],
        "eco_suggestions": [
            "Choose reusable alternatives",
            "Reduce single-use packaging",
            "Compost organic waste when possible"
        ],
        "accepted_facility_types": [
            "municipal_recycling",
            "household_waste"
        ]
    }


def generate_waste_guide(item):
    """Return a dict matching the required schema. Falls back to mock on any failure."""
    if client is None:
        return _mock_waste_guide(item)

    prompt = f"""
Provide ONLY valid JSON (no markdown, no explanations, no code fences) that exactly matches the following schema:

{{
  "category": "",
  "category_icon": "",
  "recyclable": true,
  "hazardous": false,
  "hazard_warning": "",
  "disposal_instructions": "",
  "recycling_steps": [],
  "eco_suggestions": [],
  "accepted_facility_types": []
}}

Analyze the waste item: "{item}"

Populate each field with appropriate values and types. `recycling_steps`, `eco_suggestions`, and `accepted_facility_types` must be JSON arrays. Do not include any additional fields.
"""

    try:
        response = client.chat.completions.create(
            model=Config.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful AI waste management expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )

        result = response.choices[0].message.content

        print("===== GROQ RESPONSE =====")
        print(result)
        print("=========================")

        try:
            parsed = json.loads(result)

            # Validate that the response is a dictionary
            if not isinstance(parsed, dict):
                return _mock_waste_guide(item)

            # Ensure required keys exist
            required_keys = {
                "category",
                "category_icon",
                "recyclable",
                "hazardous",
                "hazard_warning",
                "disposal_instructions",
                "recycling_steps",
                "eco_suggestions",
                "accepted_facility_types",
            }

            if not required_keys.issubset(parsed.keys()):
                print("Missing required JSON keys")
                return _mock_waste_guide(item)

            return parsed

        except Exception as e:
            print("JSON Parse Error:", e)
            print(result)
            return _mock_waste_guide(item)
    except Exception:
        return _mock_waste_guide(item)
