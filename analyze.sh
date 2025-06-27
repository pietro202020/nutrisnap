#!/bin/bash

# === Konfiguracja ===
GEMINI_API_KEY="1234"
IMG_PATH="$HOME/Downloads/nutrisnap/meal2.jpg"

# === Sprawdź, czy plik istnieje ===
if [ ! -f "$IMG_PATH" ]; then
  echo "Błąd: Nie znaleziono pliku obrazu pod $IMG_PATH"
  exit 1
fi

OPTIMIZED_IMG="$HOME/Downloads/nutrisnap/tmp/meal_optimized.jpg"

convert "$IMG_PATH" -resize 256x256\> -strip -interlace Plane -quality 70 "$OPTIMIZED_IMG"


# === Kodowanie obrazu do base64 ===
TEMP_B64=$(mktemp)
trap 'rm -f "$TEMP_B64"' EXIT
base64 "$OPTIMIZED_IMG" > "$TEMP_B64"

# === Budowanie JSON payloadu ===
TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_JSON"' EXIT

cat > "$TEMP_JSON" << EOF
{
  "system_instruction": {
    "parts": [
      {
        "text": "You are a nutrition analysis assistant. If the image contains food, respond ONLY with a deterministic and complete JSON object in this exact format:\n\n{\n  \"name\": \"<food name>\",\n  \"calories_kcal\": <float>,\n  \"serving_size_g\": <float>,\n  \"fat_total_g\": <float>,\n  \"fat_saturated_g\": <float>,\n  \"protein_g\": <float>,\n  \"sodium_mg\": <float>,\n  \"potassium_mg\": <float>,\n  \"cholesterol_mg\": <float>,\n  \"carbohydrates_total_g\": <float>,\n  \"fiber_g\": <float>,\n  \"sugar_g\": <float>\n}\n\nName the food or most dominant dish. The values must be estimated to the best of your ability based on typical servings(based on USDA/FDC or similar sources). Do NOT include any units (e.g., 'g', 'mg', 'kcal') or ranges. Estimate each value as a realistic float with at least one decimal place that is not zero (e.g. 1312.3 instead of 1300.0 or 350.0). Avoid round numbers. Do not round unless you are confident the value would truly be exact. If the image does NOT contain food, respond only with:\n\n{ \"error\": \"No food detected in the image.\" }"
      }
    ]
  },
  "contents": [
    {
      "parts": [
        {
          "text": "Analyze this image."
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "$(cat "$TEMP_B64")"
          }
        }
      ]
    }
  ]
}
EOF

# === Wysłanie żądania do Gemini ===
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d "@$TEMP_JSON" | jq