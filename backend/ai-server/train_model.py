# train_model.py
import os
import pandas as pd
import joblib
from sklearn.tree import DecisionTreeClassifier

# 1) Load your data
CSV_PATH = os.getenv("CSV_PATH", "final_product_with_images.csv")
df = pd.read_csv(CSV_PATH)

# 2) Create the labels
def label_decision(row):
    if row["quantity"] == 0 or row.get("stock") == "Out of Stock":
        return "Reorder"
    elif row["quantity"] <= 100 or row.get("stock") == "Low Stock":
        return "Monitor"
    else:
        return "Enough"

df["ai_decision"] = df.apply(label_decision, axis=1)

# 3) Features + labels
features = df[["quantity", "Price"]]
labels   = df["ai_decision"]

# 4) Train
model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(features, labels)

# 5) Persist
os.makedirs("models", exist_ok=True)
MODEL_PATH = os.path.join("models", "demand_classifier.pkl")
joblib.dump(model, MODEL_PATH)

print(f"✅ Trained DecisionTreeClassifier and saved to {MODEL_PATH}")
