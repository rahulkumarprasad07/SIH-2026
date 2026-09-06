from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
from pydantic import BaseModel

app = FastAPI()

# Enable CORS so your frontend (HTML/JS) can communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("ml/difficulty_model.joblib")


class Stats(BaseModel):
  accuracy: float
  response_time: float
  streak: int


@app.post("/predict")
def predict_difficulty(stats: Stats):
  features = [[stats.accuracy, stats.response_time, stats.streak]]
  prediction = model.predict(features)[0]
  return {"difficulty": prediction}