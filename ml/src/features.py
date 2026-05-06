from __future__ import annotations

from typing import Tuple

import pandas as pd


FEATURE_COLUMNS = [
    "diabetes_type",
    "age",
    "sex",
    "measurement_context",
    "ate_something",
    "food_meal",
    "minutes_since_meal",
    "medication_taken_recently",
    "medication_type",
    "activity_level_last_hours",
    "stress_level",
    "hour_of_day",
    "day_of_week",
]


def build_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Build tabular features for glucose regression.

    Target: glucose_mg_dl (current reading). In production this should evolve to
    future horizon labels (e.g., +120min), but this baseline gives a stable
    training scaffold.
    """
    data = df.copy()

    data["recorded_at_iso"] = pd.to_datetime(data["recorded_at_iso"], errors="coerce")
    data["hour_of_day"] = data["recorded_at_iso"].dt.hour.fillna(0).astype(int)
    data["day_of_week"] = data["recorded_at_iso"].dt.dayofweek.fillna(0).astype(int)

    for col in ["minutes_since_meal", "stress_level", "age"]:
        data[col] = pd.to_numeric(data.get(col), errors="coerce")

    data["minutes_since_meal"] = data["minutes_since_meal"].fillna(-1)
    data["stress_level"] = data["stress_level"].fillna(3)
    data["age"] = data["age"].fillna(data["age"].median() if "age" in data else 40)

    data["ate_something"] = data.get("ate_something", False).fillna(False).astype(bool)
    data["medication_taken_recently"] = (
        data.get("medication_taken_recently", False).fillna(False).astype(bool)
    )

    for col in [
        "diabetes_type",
        "sex",
        "measurement_context",
        "food_meal",
        "medication_type",
        "activity_level_last_hours",
    ]:
        data[col] = data.get(col, "unknown").fillna("unknown").astype(str)

    X = data[FEATURE_COLUMNS].copy()
    y = pd.to_numeric(data["glucose_mg_dl"], errors="coerce").fillna(0)
    return X, y
