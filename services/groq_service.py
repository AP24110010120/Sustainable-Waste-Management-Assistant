from groq import Groq
from config import Config

client = Groq(api_key=Config.GROQ_API_KEY)


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

    response = client.chat.completions.create(
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