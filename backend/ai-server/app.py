from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Path to your CSV file
CSV_FILE_PATH = 'final_product_with_images.csv'

# Load the dataset
try:
    df = pd.read_csv(CSV_FILE_PATH)
    # Ensure 'quantity' and 'Price' are numeric, coercing errors to NaN
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
    df['Price'] = pd.to_numeric(df['Price'], errors='coerce').fillna(0)
    print(f"Successfully loaded {len(df)} records from {CSV_FILE_PATH}")
except FileNotFoundError:
    print(f"Error: {CSV_FILE_PATH} not found. Please ensure the CSV is in the same directory as app.py")
    df = pd.DataFrame() # Create an empty DataFrame to prevent further errors
except Exception as e:
    print(f"Error loading CSV: {e}")
    df = pd.DataFrame()

# Simple AI prediction logic (example)
def predict_stock_status(row):
    if row['quantity'] < 50:
        return "Reorder"
    elif row['quantity'] < 150:
        return "Monitor"
    else:
        return "Enough"

def get_stock_status(row):
    if row['quantity'] == 0:
        return "Out of Stock"
    elif row['quantity'] < 100: # Example threshold for low stock
        return "Low Stock"
    else:
        return "In Stock"

@app.route('/predict-all', methods=['GET'])
def predict_all():
    if df.empty:
        return jsonify({"error": "Data not loaded. Check CSV file."}), 500

    # Create a copy to add prediction and stock status without modifying original df
    df_result = df.copy()

    # Apply prediction and stock status
    df_result['ai_prediction'] = df_result.apply(predict_stock_status, axis=1)
    df_result['stock'] = df_result.apply(get_stock_status, axis=1)

    # Select only the columns needed for the frontend, INCLUDING 'Category'
    # Ensure all columns expected by the frontend are here
    required_columns = [
        'ProductID', 'ProductName', 'quantity', 'Price', 'stock', 'ai_prediction', 'Category', 'Image' # ADD 'Category' HERE
    ]
    
    # Filter df_result to only include required columns, handling missing ones gracefully
    # This ensures that if a column is missing in the CSV, it doesn't crash,
    # but it will be 'undefined' on the frontend, which we now know to fix.
    available_columns = [col for col in required_columns if col in df_result.columns]
    df_result = df_result[available_columns]

    # Convert DataFrame to a list of dictionaries (JSON format)
    return jsonify(df_result.to_dict('records'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    product_id = data.get('product_id')

    if df.empty:
        return jsonify({"error": "Data not loaded. Check CSV file."}), 500

    product_data = df[df['ProductID'] == product_id]

    if product_data.empty:
        return jsonify({"error": "Product not found"}), 404

    # Get the first matching product (assuming ProductID is unique)
    product_row = product_data.iloc[0]

    # Apply prediction and stock status
    prediction = predict_stock_status(product_row)
    stock_status = get_stock_status(product_row)

    response_data = {
        "ProductID": product_row['ProductID'],
        "ProductName": product_row['ProductName'],
        "quantity": product_row['quantity'],
        "Price": product_row['Price'],
        "stock": stock_status,
        "ai_prediction": prediction,
        "Category": product_row['Category'], # Ensure Category is included here too for single product lookup
        "Image":product_row['Image']
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
