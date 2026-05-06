from __future__ import annotations

import argparse
from pathlib import Path
from typing import Literal, Optional

import joblib
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL = None


class PredictPayload(BaseModel):
    diabetes_type: Literal["type1", "type2", "unknown"] = "unknown"
    age: int = Field(default=40, ge=1, le=120)
    sex: Literal["female", "male", "other"] = "other"
    measurement_context: Literal[
        "fasting", "pre_meal", "post_meal_1h", "post_meal_2h", "bedtime", "random"
    ] = "random"
    ate_something: bool = False
    food_meal: Optional[str] = "unknown"
    minutes_since_meal: Optional[float] = None
    medication_taken_recently: bool = False
    medication_type: Optional[str] = "unknown"
    activity_level_last_hours: Literal["none", "light", "moderate", "intense"] = "none"
    stress_level: Optional[float] = Field(default=3, ge=1, le=5)
    hour_of_day: int = Field(default=12, ge=0, le=23)
    day_of_week: int = Field(default=0, ge=0, le=6)


app = FastAPI(title="Glucolog ML Predictor", version="1.0.0")


@app.get("/health")
def health() -> dict:
    return {"ok": MODEL is not None}


@app.post("/predict")
def predict(payload: PredictPayload) -> dict:
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    frame = pd.DataFrame(
        [
            {
                "diabetes_type": payload.diabetes_type,
                "age": payload.age,
                "sex": payload.sex,
                "measurement_context": payload.measurement_context,
                "ate_something": payload.ate_something,
                "food_meal": payload.food_meal or "unknown",
                "minutes_since_meal": (
                    payload.minutes_since_meal
                    if payload.minutes_since_meal is not None
                    else -1
                ),
                "medication_taken_recently": payload.medication_taken_recently,
                "medication_type": payload.medication_type or "unknown",
                "activity_level_last_hours": payload.activity_level_last_hours,
                "stress_level": payload.stress_level if payload.stress_level is not None else 3,
                "hour_of_day": payload.hour_of_day,
                "day_of_week": payload.day_of_week,
            }
        ]
    )

    pred = float(MODEL.predict(frame)[0])
    return {
        "predicted_glucose_mg_dl": round(pred, 2),
        "risk_flag_high": pred > 180,
        "risk_flag_low": pred < 70,
    }


def load_model(artifacts_dir: Path) -> None:
    global MODEL
    model_path = artifacts_dir / "glucose_regressor.joblib"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found at {model_path}. Run `npm run ml:train` first."
        )
    MODEL = joblib.load(model_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifacts", default="ml/artifacts", help="Artifacts directory")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()

    load_model(Path(args.artifacts))
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
