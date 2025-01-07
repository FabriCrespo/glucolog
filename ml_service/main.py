from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
from datetime import datetime
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model file path
MODEL_PATH = "glucose_model.joblib"
LABEL_ENCODER_PATH = "label_encoder.joblib"

# Initialize model and label encoder
model = None
label_encoder = LabelEncoder()

class GlucoseData(BaseModel):
    hour: int
    day_of_week: int
    meal_type: str
    last_glucose: float

def load_model():
    global model, label_encoder
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        
load_model()

def prepare_features(data: GlucoseData):
    # Encode meal type
    if not label_encoder.classes_.size:
        label_encoder.fit(['none', 'desayuno', 'almuerzo', 'cena', 'Otro'])
    meal_type_encoded = label_encoder.transform([data.meal_type])[0]
    
    # Create feature array
    features = np.array([[
        data.hour,
        data.day_of_week,
        meal_type_encoded,
        data.last_glucose
    ]])
    
    return features

@app.post("/predict")
async def predict_glucose(data: GlucoseData):
    try:
        features = prepare_features(data)
        
        if model is None:
            raise HTTPException(status_code=500, detail="Model not trained yet")
            
        prediction = model.predict(features)[0]
        
        # Calculate confidence based on model's feature importances
        confidence = float(np.mean(model.feature_importances_) * 100)
        
        return {
            "predicted_glucose": float(prediction),
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(data: list[GlucoseData]):
    global model
    try:
        if len(data) < 5:
            raise HTTPException(status_code=400, detail="Need at least 5 records to train")
            
        # Prepare training data
        X = []
        y = []
        
        for i in range(len(data) - 1):
            current_record = data[i]
            next_record = data[i + 1]
            
            features = prepare_features(current_record)
            X.append(features[0])
            y.append(next_record.last_glucose)
            
        X = np.array(X)
        y = np.array(y)
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Save model
        joblib.dump(model, MODEL_PATH)
        joblib.dump(label_encoder, LABEL_ENCODER_PATH)
        
        return {"message": "Model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Load model on startup
@app.on_event("startup")
async def startup_event():
    load_model()
