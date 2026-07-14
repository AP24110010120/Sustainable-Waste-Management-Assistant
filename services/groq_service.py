from config import Config

GROQ_API_KEY = Config.GROQ_API_KEY

try:
    from groq import Groq
except ImportError:
    Groq = None

client = None
if GROQ_API_KEY and Groq is not None:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        client = None


def _mock_waste_guide(item):
    return (
        f"♻️ Waste Category: General Waste\n"
        f"🗑️ Disposal Method: Dispose of '{item}' in regular trash or recycling if accepted locally. "
        f"Clean and separate any recyclable portions first.\n"
        f"♻️ Recycling Information: Items made from paper, plastic, glass, and metal are often recyclable, "
        f"but check your local program before recycling.\n"
        f"⚠️ Safety Precautions: Handle broken or sharp materials with care and wear gloves when needed. "
        f"Keep hazardous substances like batteries, electronics, and chemicals separate.\n"
        f"🌍 Environmental Impact: Improper disposal can pollute soil and waterways and harm wildlife.\n"
        f"💡 Eco-Friendly Suggestion: Reduce waste by choosing reusable products, avoiding single-use packaging, "
        f"and composting organic material when possible."
    )


def generate_waste_guide(item):
    if client is None:
        return _mock_waste_guide(item)

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

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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
            temperature=0.3,
            max_tokens=500
        )

        return response.choices[0].message.content
    except Exception:
        return _mock_waste_guide(item)
