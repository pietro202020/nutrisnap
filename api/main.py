from __future__ import annotations

import base64
import os, json, asyncio, httpx
from datetime import datetime, timedelta
from pathlib import Path as FSPath 
from fastapi import Path as ApiPath 
from typing import Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy import delete
from fastapi.staticfiles import StaticFiles

from .utils import optimize_and_encode
from .db import engine, get_session, init_db   # <── tu
from .models import Meal      
import uuid



load_dotenv()  # picks up .env in repo root or api/



GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta"
    "/models/gemini-2.0-flash:generateContent?key="
    + os.environ["GEMINI_API_KEY"]
)

SYSTEM_PROMPT = ("You are a nutrition analysis assistant. If the image contains food, respond ONLY with a deterministic and complete JSON object in this exact format:\n\n{\n  \"name\": \"<food name>\",\n  \"calories_kcal\": <float>,\n  \"serving_size_g\": <float>,\n  \"fat_total_g\": <float>,\n  \"fat_saturated_g\": <float>,\n  \"protein_g\": <float>,\n  \"sodium_mg\": <float>,\n  \"potassium_mg\": <float>,\n  \"cholesterol_mg\": <float>,\n  \"carbohydrates_total_g\": <float>,\n  \"fiber_g\": <float>,\n  \"sugar_g\": <float>\n}\n\nName the food or most dominant dish. The values must be estimated to the best of your ability based on typical servings(based on USDA/FDC or similar sources). Do NOT include any units (e.g., 'g', 'mg', 'kcal') or ranges. Estimate each value as a realistic float with at least one decimal place that is not zero (e.g. 1312.3 instead of 1300.0 or 350.0). Avoid round numbers. Do not round unless you are confident the value would truly be exact. If the image does NOT contain food, respond only with:\n\n{ \"error\": \"No food detected in the image.\" }")




ALLOWED_MIME = {
    "image/jpeg",
    "image/png",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/webp",
}


# 2.  Helper: cutoff = Monday of previous ISO week
# ------------------------------------------------------------------
def monday_of_previous_week(now: datetime | None = None) -> datetime:
    now = now or datetime.utcnow()
    this_monday = now - timedelta(days=now.isoweekday() - 1)
    prev_monday = this_monday - timedelta(days=7)
    return prev_monday.replace(hour=0, minute=0, second=0, microsecond=0)






app = FastAPI(title="NutriSnap API", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",
        "http://localhost:8081",
        "http://127.0.0.1:19006",
        "exp://127.0.0.1:19000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
THUMB_DIR = FSPath("thumbs")
THUMB_DIR.mkdir(exist_ok=True)

app.mount("/thumbs", StaticFiles(directory=THUMB_DIR), name="thumbs")
init_db()




def prune_old_meals() -> None:
    cutoff = monday_of_previous_week()
    stmt = delete(Meal).where(Meal.created_at < cutoff)
    with Session(engine) as s:
        s.exec(stmt)
        s.commit()


@app.on_event("startup")
async def start_prune_loop():
    async def loop():
        while True:
            prune_old_meals()
            await asyncio.sleep(24 * 3600)

    asyncio.create_task(loop())


@app.get("/")
def health():
    return {"status": "ok"}


# Placeholder for GEMINI key (later steps will use it)
@app.get("/env")
def show_env():
    return {"have_key": bool(os.getenv("GEMINI_API_KEY"))}




@app.get("/meals")
def meals(session: Session = Depends(get_session)):
    cutoff = monday_of_previous_week()
    rows = session.exec(
        select(Meal)
        .where(Meal.created_at >= cutoff)
        .order_by(Meal.created_at.desc())
    ).all()
    return [
        {
            "created_at": m.created_at.isoformat(),
            "meal_type": m.meal_type,   
            "thumb_uri": m.thumb_uri,     
            **m.data                       # nutrition JSON
        }
        for m in rows]




@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    meal_type: str | None = Form(None),      
    date: str | None = Form(None),  
    session: Session = Depends(get_session),
):


    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG supported")

    # 1. read raw bytes
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    # 2. optimize & encode
    try:
        img_b64 = optimize_and_encode(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {e}")
    
    thumb_filename = f"{uuid.uuid4()}.jpg"
    (THUMB_DIR / thumb_filename).write_bytes(          # zapis pliku
        base64.b64decode(img_b64)
    )
    thumb_uri = f"/thumbs/{thumb_filename}"  

    # 3. build Gemini payload
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [
            {
                "parts": [
                    {"text": "Analyze this image."},
                    {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
                ]
            }
        ],
        "generation_config": {"max_output_tokens": 200},
    }

    # 4. call Gemini
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(GEMINI_URL, json=payload)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {e}")

    # 5. parse response
    try:
        resp_json = resp.json()
        txt = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
        if txt.startswith("```json"):
            txt = txt.split("```json")[1]
        if txt.endswith("```"):
            txt = txt.split("```")[0]
        data = json.loads(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {e, type(resp, txt, data)}")

    if data.get("error"):
        raise HTTPException(status_code=422, detail=data["error"])
    
    session.add(
        Meal(
            data=data,
            meal_type=meal_type,
            thumb_uri=thumb_uri,
            created_at=datetime.fromisoformat(date) if date else datetime.utcnow(),
        )
    )
    session.commit()



    return {**data, "thumb_uri": thumb_uri}
"""""
@app.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int = Path(..., gt=0),
    session: Session = Depends(get_session),
):
    meal = session.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    # usuń plik miniatury
    if meal.thumb_uri:
        try:
            (THUMB_DIR / Path(meal.thumb_uri).name).unlink(missing_ok=True)
        except Exception:
            pass
    session.delete(meal)
    session.commit()
    return {"ok": True}
"""
@app.delete("/delete-thumb/{filename}")
def delete_by_thumb(
    filename: str = ApiPath(..., pattern=r"^[A-Fa-f0-9\-]{36}\.jpg$"),  # 36-znakowy uuid.jpg
    session: Session = Depends(get_session),
):
    thumb_uri = f"/thumbs/{filename}"
    meal = session.exec(select(Meal).where(Meal.thumb_uri == thumb_uri)).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # usuń plik miniatury (bez błędu, jeśli już nie istnieje)
    try:
        (THUMB_DIR / filename).unlink(missing_ok=True)
    except Exception:
        pass

    session.delete(meal)
    session.commit()
    return {"ok": True}