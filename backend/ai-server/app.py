# ai-server/app.py

import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import joblib

logging.basicConfig(level=logging.INFO)
BASE_DIR = os.path.dirname(__file__)

# ——— Load model ———
MODEL_PATH = os.getenv("AI_MODEL_PATH",
                       os.path.join(BASE_DIR, "models", "demand_classifier.pkl"))
if not os.path.exists(MODEL_PATH):
    logging.error(f"Model not found at {MODEL_PATH}")
    clf = None
else:
    clf = joblib.load(MODEL_PATH)
    logging.info("Loaded classifier")

# ——— Load CSV snapshot ———
CSV_PATH = os.getenv("CSV_PATH",
                     os.path.join(BASE_DIR, "final_product_with_images.csv"))
df = pd.read_csv(CSV_PATH)
# ensure numeric
df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0).astype(int)
df["Price"]    = pd.to_numeric(df["Price"],    errors="coerce").fillna(0.0)

LOW_STOCK_THRESHOLD = int(os.getenv("LOW_STOCK_THRESHOLD", 100))

def predict_label(qty, price):
    if clf is None:
        return "Enough"
    try:
        return clf.predict([[qty, price]])[0]
    except Exception as e:
        logging.error(f"Prediction error for ({qty},{price}): {e}")
        return "Enough"

# ——— Flask app ———
app = Flask(__name__)
CORS(app)

@app.route("/predict-all", methods=["GET"])
def predict_all():
    out = []
    for _, row in df.iterrows():
        qty   = int(row["quantity"])
        price = float(row["Price"])
        stock = (
            "Out of Stock" if qty == 0 else
            "Low Stock"   if qty < LOW_STOCK_THRESHOLD else
            "In Stock"
        )
        out.append({
            "ProductID":     row.get("ProductID"),
            "ProductName":   row.get("ProductName"),
            "quantity":      qty,
            "Price":         price,
            "stock":         stock,
            "ai_prediction": predict_label(qty, price)
        })
    return jsonify(out)

@app.route("/forecast", methods=["POST"])
def forecast():
    payload = request.get_json(force=True)
    feats   = payload.get("features", [])
    if (not isinstance(feats, list)) or len(feats) != 2:
        return jsonify({"error": "features must be [quantity,price]"}), 400
    qty, price = feats
    return jsonify({"forecasted_decision": predict_label(int(qty), float(price))})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)), debug=True)
