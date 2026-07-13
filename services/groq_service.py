import json
import re

from groq import Groq

from config import Config

client = Groq(api_key=Config.GROQ_API_KEY) if Config.GROQ_API_KEY else None


def _get_client():
    global client
    if client is None and Config.GROQ_API_KEY:
        client = Groq(api_key=Config.GROQ_API_KEY)
    return client


def _clean_json_text(text):
    if not text:
        return ""

    cleaned = text.strip()
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    return cleaned.strip()


def generate_waste_guide(item):

    prompt = f"""
You are an expert Sustainable Waste Management Assistant.

Analyze the waste item: "{item}"

Respond in the following format:

♻️ Waste Category:
(State whether it is Organic, Plastic, Metal, Glass, Paper, Electronic, Hazardous, Medical, etc.)

🗑️ Disposal Method:
(Explain the correct way to dispose of it.)

♻️ Recycling Information:
(State whether it can be recycled and how.)

⚠️ Safety Precautions:
(Mention any risks while handling or disposing.)

🌍 Environmental Impact:
(Briefly explain how improper disposal affects the environment.)

💡 Eco-Friendly Suggestion:
(Suggest a greener alternative or a way to reduce waste.)

Keep the response clear, practical, and under 250 words.
"""

    groq_client = _get_client()
    if groq_client is None:
        return "Unable to generate waste guide. Please configure GROQ_API_KEY."

    response = groq_client.chat.completions.create(
        model=Config.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful AI waste management expert."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=Config.GROQ_TEMPERATURE,
        max_tokens=Config.GROQ_MAX_TOKENS
    )

    return response.choices[0].message.content


def analyze_waste_json(item):
    prompt = f"""
You are an expert sustainable waste management assistant.
Analyze the waste item: "{item}".
Return ONLY valid JSON with the following keys:
category, category_icon, recyclable, hazardous, disposal, recycling, hazard_warning, eco_friendly_tip, accepted_facility_types.
Use short values and make recyclable and hazardous booleans.
"""

    groq_client = _get_client()
    if groq_client is None:
        return {
            "category": "Unknown",
            "category_icon": "♻️",
            "recyclable": False,
            "hazardous": False,
            "disposal": "Please dispose of this item responsibly.",
            "recycling": "Check local recycling guidance.",
            "hazard_warning": "Handle with care.",
            "eco_friendly_tip": "Reduce waste where possible.",
            "accepted_facility_types": [],
        }

    response = groq_client.chat.completions.create(
        model=Config.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You return only valid JSON for waste analysis."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=Config.GROQ_TEMPERATURE,
        max_tokens=Config.GROQ_MAX_TOKENS
    )

    content = response.choices[0].message.content
    cleaned = _clean_json_text(content)

    try:
        parsed = json.loads(cleaned)
        if not isinstance(parsed, dict):
            raise ValueError("Groq response is not a JSON object")

        return {
            "category": parsed.get("category", "Unknown"),
            "category_icon": parsed.get("category_icon", "♻️"),
            "recyclable": bool(parsed.get("recyclable", False)),
            "hazardous": bool(parsed.get("hazardous", False)),
            "disposal": parsed.get("disposal", "Please dispose of this item responsibly."),
            "recycling": parsed.get("recycling", "Check local recycling guidance."),
            "hazard_warning": parsed.get("hazard_warning", "Handle with care."),
            "eco_friendly_tip": parsed.get("eco_friendly_tip", "Reduce waste where possible."),
            "accepted_facility_types": parsed.get("accepted_facility_types", []) if isinstance(parsed.get("accepted_facility_types", []), list) else [],
        }
    except Exception:
        return {
            "category": "Unknown",
            "category_icon": "♻️",
            "recyclable": False,
            "hazardous": False,
            "disposal": "Please dispose of this item responsibly.",
            "recycling": "Check local recycling guidance.",
            "hazard_warning": "Handle with care.",
            "eco_friendly_tip": "Reduce waste where possible.",
            "accepted_facility_types": [],
        }