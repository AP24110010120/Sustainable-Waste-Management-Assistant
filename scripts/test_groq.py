import sys
import pathlib
import json

# Ensure project root is on sys.path
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from services.groq_service import generate_waste_guide

res = generate_waste_guide('test banana')
print(type(res))
print(json.dumps(res, indent=2, ensure_ascii=False))
