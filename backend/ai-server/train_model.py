import os
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import joblib

# 1) Load your data
CSV_PATH = os.getenv('CSV_PATH', 'final_product_with_images.csv')
df = pd.read_csv(CSV_PATH)

# 2) Pick one or more numeric features for X, and quantity as y
#    Here we just use Price → quantity as a toy example
df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
df['Price']    = pd.to_numeric(df['Price'],    errors='coerce').fillna(0)
X = df[['Price']]
y = df['quantity']

# 3) Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# 4) Fit a simple model
model = LinearRegression()
model.fit(X_train, y_train)

# 5) Evaluate
r2 = model.score(X_test, y_test)
print(f"Test R²: {r2:.3f}")

# 6) Dump to models/demand_forecast.pkl
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/demand_forecast.pkl')
print("Saved model → models/demand_forecast.pkl")