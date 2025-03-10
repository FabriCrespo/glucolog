@echo off
echo Installing required packages...
python -m pip install --user fastapi uvicorn scikit-learn pandas numpy python-multipart

echo Starting ML server...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
