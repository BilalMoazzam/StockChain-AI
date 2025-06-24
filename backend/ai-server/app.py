import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import joblib

# ——— Logging setup ———
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # ✅ fixed __file__

# ——— Model loading ———
MODEL_PATH = os.getenv(
    'AI_MODEL_PATH',
    os.path.join(BASE_DIR, 'models', 'demand_forecast.pkl')
)
logging.info(f"Attempting to load model from: {MODEL_PATH}")
if not os.path.exists(MODEL_PATH):
    logging.error(f"Model file not found at {MODEL_PATH}; forecasts will return 0.0")
    model = None
else:
    try:
        model = joblib.load(MODEL_PATH)
        logging.info("Model loaded successfully")
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
        model = None

# ——— Data loading ———
CSV_PATH = os.getenv('CSV_PATH', os.path.join(BASE_DIR, 'final_product_with_images.csv'))
LOW_STOCK_THRESHOLD = int(os.getenv('LOW_STOCK_THRESHOLD', 100))

def load_data():
    df = pd.read_csv(CSV_PATH)
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
    df['Price']    = pd.to_numeric(df['Price'],    errors='coerce').fillna(0)
    return df

try:
    df = load_data()
    logging.info(f"Loaded {len(df)} rows from {CSV_PATH}")
except Exception as e:
    logging.error(f"Error loading CSV: {e}")
    df = pd.DataFrame()

def forecast_demand(features: list) -> float:
    if model:
        return float(model.predict([features])[0])
    return 0.0

# ——— Flask app ———
def create_app():
    app = Flask(__name__)  # ✅ fixed __name__
    CORS(app)

    @app.route('/inventory', methods=['GET'])
    def get_inventory():
        items, alerts = [], []
        for _, row in df.iterrows():
            qty = row['quantity']
            status = (
                'Out of Stock' if qty == 0 else
                'Low Stock'   if qty < LOW_STOCK_THRESHOLD else
                'In Stock'
            )
            items.append({
                'ProductID':     row.get('ProductID'),
                'ProductName':   row.get('ProductName'),
                'ProductBrand':  row.get('ProductBrand'),
                'Gender':        row.get('Gender'),
                'Description':   row.get('Description'),
                'PrimaryColor':  row.get('PrimaryColor'),
                'quantity':      qty,
                'Price':         row.get('Price'),
                'stock':         status,
                'Category':      row.get('Category'),
                'Image':         row.get('Image'),
            })
            if status in ('Low Stock', 'Out of Stock'):
                alerts.append({
                    'ProductID':   row.get('ProductID'),
                    'ProductName': row.get('ProductName'),
                    'stock':       status
                })
        return jsonify({'items': items, 'alerts': alerts})

    @app.route('/predict-all', methods=['GET'])
    def predict_all():
        result = []
        for _, row in df.iterrows():
            qty = row['quantity']
            status = (
                'Out of Stock' if qty == 0 else
                'Low Stock'   if qty < LOW_STOCK_THRESHOLD else
                'In Stock'
            )
            prediction = forecast_demand([row['Price']])
            ai_label = 'Reorder' if prediction > qty else 'Enough'

            result.append({
                'ProductID':     row.get('ProductID'),
                'ProductName':   row.get('ProductName'),
                'ProductBrand':  row.get('ProductBrand'),
                'Gender':        row.get('Gender'),
                'Description':   row.get('Description'),
                'PrimaryColor':  row.get('PrimaryColor'),
                'quantity':      qty,
                'Price':         row.get('Price'),
                'stock':         status,
                'Category':      row.get('Category'),
                'Image':         row.get('Image'),
                'ai_prediction': ai_label
            })

        return jsonify(result)

    @app.route('/forecast', methods=['POST'])
    def forecast():
        data = request.get_json(force=True)
        feats = data.get('features')
        if not feats:
            return jsonify({'error': 'features required'}), 400
        return jsonify({'forecasted_demand': forecast_demand(feats)})

    @app.route('/alerts', methods=['GET'])
    def get_alerts():
        alerts = []
        for _, row in df.iterrows():
            qty = row['quantity']
            if qty == 0 or qty < LOW_STOCK_THRESHOLD:
                alerts.append({
                    'ProductID':   row.get('ProductID'),
                    'ProductName': row.get('ProductName'),
                    'stock':       'Out of Stock' if qty == 0 else 'Low Stock'
                })
        return jsonify(alerts)

    @app.route('/trending', methods=['GET'])
    def get_trending():
        df['sales_value'] = df['quantity'] * df['Price']
        top5 = df.nlargest(5, 'sales_value')
        trending = [{

            'ProductID':    r.get('ProductID'),
            'ProductName':  r.get('ProductName'),
            'ProductBrand': r.get('ProductBrand'),
            'Gender':       r.get('Gender'),
            'Description':  r.get('Description'),
            'PrimaryColor': r.get('PrimaryColor'),
            'sales_value':  r['sales_value'],
            'quantity':     r['quantity'],
            'Price':        r['Price'],
            'Category':     r.get('Category'),
            'Image':        r.get('Image')
        } for _, r in top5.iterrows()]
        return jsonify(trending)

    return app

# ✅ Proper main block
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5001)), debug=True)
