
import json

# File path (adjust as needed)
file_path = 'last_gemini_response.txt'

# Read and parse JSON content
with open(file_path, 'r', encoding='utf-8') as file:
    content = json.load(file)  # Parses JSON into Python dict/list

# Now `content` is a Python object (dict or list)
txt = content["candidates"][0]["content"]["parts"][0]["text"].strip()
if txt.startswith("```json"):
    txt = txt.split("```json")[1]
if txt.endswith("```"):
    txt = txt.split("```")[0]
data = json.loads(txt)["sugar_g"]
print(data)  # Optional: print to verify