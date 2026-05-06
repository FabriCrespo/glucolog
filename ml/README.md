# Glucolog Prediction Project

This module adds a full ML workflow inside the same repository:

- Feature-ready training pipeline for glucose prediction
- Model artifact generation (`joblib`)
- FastAPI prediction service for online inference

## Recommended stack

- **Modeling:** `scikit-learn` (`HistGradientBoostingRegressor`)
- **Serving:** `FastAPI` + `uvicorn`
- **Data:** synthetic dataset from `scripts/generate_synthetic_diabetes_dataset.py`, then real app exports

This gives a strong baseline for tabular health data and is easy to maintain.

## 1) Install Python dependencies

```bash
pip install -r ml/requirements.txt
```

## 2) Train model

```bash
npm run ml:train
```

By default it uses:

- `datasets/synthetic_t1_t2_120d.csv`
- outputs to `ml/artifacts/`

Generated files:

- `ml/artifacts/glucose_regressor.joblib`
- `ml/artifacts/metrics.json`

## 3) Serve prediction API

```bash
npm run ml:serve
```

Server:

- `GET /health`
- `POST /predict`

## Example request

```bash
curl -X POST http://127.0.0.1:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "diabetes_type": "type2",
    "age": 52,
    "sex": "male",
    "measurement_context": "post_meal_1h",
    "ate_something": true,
    "food_meal": "almuerzo",
    "minutes_since_meal": 65,
    "medication_taken_recently": true,
    "medication_type": "Metformina",
    "activity_level_last_hours": "light",
    "stress_level": 3,
    "hour_of_day": 14,
    "day_of_week": 2
  }'
```

## Next step for better accuracy

Current target is a baseline on current reading. For production-grade accuracy:

1. Train horizon targets (`+60`, `+120` min glucose)
2. Add lag features (`prev_1`, `prev_3_mean`, trend slope)
3. Add schedule-joined features from `glucose_features`
4. Tune with cross-validation and time-series split
