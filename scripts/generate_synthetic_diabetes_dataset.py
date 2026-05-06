#!/usr/bin/env python3
"""
Generate synthetic glucose datasets for Type 1 and Type 2 diabetes.

Outputs:
- CSV flat file for analytics/ML
- JSONL file with records similar to app schema

This script creates synthetic data only (not real patients).
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable, List


MEASUREMENT_CONTEXTS = [
    "fasting",
    "pre_meal",
    "post_meal_1h",
    "post_meal_2h",
    "bedtime",
    "random",
]
ACTIVITY_LEVELS = ["none", "light", "moderate", "intense"]
MEALS = ["desayuno", "almuerzo", "cena", "otro"]
MEDICATIONS_T1 = ["Insulina rápida", "Insulina basal"]
MEDICATIONS_T2 = ["Metformina", "Insulina basal", "DPP-4", "GLP-1"]


@dataclass
class Patient:
    patient_id: str
    diabetes_type: str
    age: int
    sex: str


def random_patient(diabetes_type: str) -> Patient:
    return Patient(
        patient_id=str(uuid.uuid4()),
        diabetes_type=diabetes_type,
        age=random.randint(18, 80),
        sex=random.choice(["female", "male"]),
    )


def glucose_baseline(diabetes_type: str, context: str) -> float:
    if diabetes_type == "type1":
        base = random.gauss(145, 30)
    else:
        base = random.gauss(155, 25)

    adjustment = {
        "fasting": -20,
        "pre_meal": -10,
        "post_meal_1h": +35,
        "post_meal_2h": +20,
        "bedtime": +5,
        "random": 0,
    }[context]
    return base + adjustment


def activity_effect(level: str) -> float:
    return {"none": 0, "light": -5, "moderate": -10, "intense": -18}[level]


def stress_effect(level: int) -> float:
    return (level - 3) * 6


def med_effect(diabetes_type: str, took_med: bool) -> float:
    if not took_med:
        return +10 if diabetes_type == "type1" else +8
    return -12 if diabetes_type == "type1" else -10


def clamp(value: float, low: int, high: int) -> int:
    return int(max(low, min(high, round(value))))


def generate_records_for_patient(
    patient: Patient,
    days: int,
    min_readings_per_day: int,
    max_readings_per_day: int,
) -> List[dict]:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    records: List[dict] = []

    for day_offset in range(days):
        day = now - timedelta(days=day_offset)
        n = random.randint(min_readings_per_day, max_readings_per_day)

        for _ in range(n):
            context = random.choice(MEASUREMENT_CONTEXTS)
            ate = context in {"post_meal_1h", "post_meal_2h"} or random.random() < 0.45
            meal = random.choice(MEALS) if ate else None
            minutes_since_meal = (
                random.randint(0, 240) if ate else None
            )
            activity = random.choices(
                ACTIVITY_LEVELS, weights=[0.35, 0.35, 0.2, 0.1], k=1
            )[0]
            stress = random.randint(1, 5)
            took_med = random.random() < (0.8 if patient.diabetes_type == "type1" else 0.7)
            med_name = None
            if took_med:
                med_name = random.choice(
                    MEDICATIONS_T1 if patient.diabetes_type == "type1" else MEDICATIONS_T2
                )

            hour = random.choice([6, 8, 11, 13, 16, 19, 21, 23])
            minute = random.choice([0, 10, 20, 30, 40, 50])
            at = day.replace(hour=hour, minute=minute)

            value = (
                glucose_baseline(patient.diabetes_type, context)
                + activity_effect(activity)
                + stress_effect(stress)
                + med_effect(patient.diabetes_type, took_med)
                + random.gauss(0, 12)
            )
            glucose = clamp(value, 45, 420)

            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient.patient_id,
                "diabetes_type": patient.diabetes_type,
                "age": patient.age,
                "sex": patient.sex,
                "recorded_at_iso": at.isoformat(),
                "date": at.strftime("%Y-%m-%d"),
                "time": at.strftime("%H:%M:%S"),
                "glucose_mg_dl": glucose,
                "measurement_context": context,
                "ate_something": ate,
                "food_meal": meal,
                "food_eaten": random.choice(
                    ["avena", "pollo", "arroz", "ensalada", "fruta", "pan integral"]
                )
                if ate
                else None,
                "minutes_since_meal": minutes_since_meal,
                "medication_taken_recently": took_med,
                "medication_type": med_name,
                "activity_level_last_hours": activity,
                "stress_level": stress,
                "notes": None,
                "schema_version": 1,
                "source": "synthetic_python_script",
            }
            records.append(record)

    records.sort(key=lambda x: x["recorded_at_iso"])
    return records


def write_csv(path: Path, rows: Iterable[dict]) -> None:
    rows = list(rows)
    if not rows:
        return
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_jsonl(path: Path, rows: Iterable[dict]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic diabetes datasets")
    parser.add_argument("--type1-patients", type=int, default=60)
    parser.add_argument("--type2-patients", type=int, default=60)
    parser.add_argument("--days", type=int, default=90)
    parser.add_argument("--min-readings-per-day", type=int, default=2)
    parser.add_argument("--max-readings-per-day", type=int, default=5)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--out-prefix",
        type=str,
        default="synthetic_diabetes",
        help="Output file prefix inside ./datasets",
    )
    args = parser.parse_args()

    random.seed(args.seed)
    out_dir = Path("datasets")
    out_dir.mkdir(parents=True, exist_ok=True)

    patients: List[Patient] = []
    patients += [random_patient("type1") for _ in range(args.type1_patients)]
    patients += [random_patient("type2") for _ in range(args.type2_patients)]

    all_records: List[dict] = []
    for p in patients:
        all_records.extend(
            generate_records_for_patient(
                p,
                days=args.days,
                min_readings_per_day=args.min_readings_per_day,
                max_readings_per_day=args.max_readings_per_day,
            )
        )

    csv_path = out_dir / f"{args.out_prefix}.csv"
    jsonl_path = out_dir / f"{args.out_prefix}.jsonl"
    write_csv(csv_path, all_records)
    write_jsonl(jsonl_path, all_records)

    print(f"Generated records: {len(all_records)}")
    print(f"CSV: {csv_path}")
    print(f"JSONL: {jsonl_path}")
    print(
        "Counts by diabetes_type:",
        {
            "type1": sum(1 for r in all_records if r["diabetes_type"] == "type1"),
            "type2": sum(1 for r in all_records if r["diabetes_type"] == "type2"),
        },
    )


if __name__ == "__main__":
    main()
