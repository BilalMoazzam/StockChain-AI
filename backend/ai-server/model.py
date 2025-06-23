import pandas as pd
from sklearn.tree import DecisionTreeClassifier

def load_and_train_model():
    df = pd.read_csv("final_product_wih_images.csv")

    def label_decision(row):
        if row['quantity'] == 0 or row['stock'] == 'Out of Stock':
            return 'Reorder'
        elif row['quantity'] <= 100 or row['stock'] == 'Low Stock':
            return 'Monitor'
        else:
            return 'Enough'

    df['ai_decision'] = df.apply(label_decision, axis=1)

    features = df[['quantity', 'Price']]
    labels = df['ai_decision']

    model = DecisionTreeClassifier(max_depth=3, random_state=42)
    model.fit(features, labels)

    return model, df