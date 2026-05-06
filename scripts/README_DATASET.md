# Synthetic Diabetes Dataset Generator

Script: `scripts/generate_synthetic_diabetes_dataset.py`

## What it generates

- Synthetic glucose records for patients with:
  - `type1`
  - `type2`
- Output files in `datasets/`:
  - `<prefix>.csv`
  - `<prefix>.jsonl`

## Run

```bash
python scripts/generate_synthetic_diabetes_dataset.py
```

Example with custom sizes:

```bash
python scripts/generate_synthetic_diabetes_dataset.py --type1-patients 100 --type2-patients 120 --days 120 --out-prefix "synthetic_t1_t2_120d"
```

## Notes

- Data is synthetic and intended for testing/prototyping.
- It follows the enriched glucose schema used in the app.
