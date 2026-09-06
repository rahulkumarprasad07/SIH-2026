import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Sample synthetic data: accuracy (0.0 to 1.0), response_time (seconds), streak_count
data = {
    "accuracy": [
        0.95,
        0.90,
        0.85,
        0.75,
        0.70,
        0.60,
        0.40,
        0.30,
        0.20,
        0.80,
        0.55,
        0.35,
    ],
    "response_time": [
        2.5,
        3.1,
        4.0,
        5.2,
        6.0,
        7.5,
        10.0,
        12.0,
        15.0,
        4.5,
        8.0,
        11.0,
    ],
    "streak": [8, 6, 5, 4, 3, 2, 1, 0, 0, 4, 2, 0],
    "difficulty": [
        "Hard",
        "Hard",
        "Hard",
        "Medium",
        "Medium",
        "Medium",
        "Easy",
        "Easy",
        "Easy",
        "Hard",
        "Medium",
        "Easy",
    ],
}

df = pd.DataFrame(data)

# Features & target
X = df[["accuracy", "response_time", "streak"]]
y = df["difficulty"]

# Train model
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X, y)

# Save model file
joblib.dump(model, "ml/difficulty_model.joblib")
print("Model trained and saved to ml/difficulty_model.joblib successfully!")