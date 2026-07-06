from groq import Groq
from config import Config

client = Groq(api_key=Config.GROQ_API_KEY)

def generate_waste_guide(item):
    prompt = f"""
You are a waste management assistant.

For the item '{item}', provide:

1. Waste Category
2. Disposal Instructions
3. Hazard Warning
4. Recycling Information
5. Eco-friendly Suggestion

Keep the response short and clear.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content