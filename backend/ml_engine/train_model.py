import os
import random
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

def generate_synthetic_data(num_samples=10000):
    data = []
    countries = ['US', 'UK', 'IN', 'CN', 'RU', 'BR', 'DE', 'FR', 'JP']
    devices = ['Desktop', 'Mobile', 'Tablet']
    browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Unknown']

    for _ in range(num_samples):
        # 80% normal logins, 20% malicious/bot logins
        is_malicious = 1 if random.random() < 0.2 else 0

        if is_malicious:
            failed_attempts = random.randint(3, 15)
            country = random.choice(['CN', 'RU', 'BR', 'Unknown']) if random.random() < 0.6 else random.choice(countries)
            device = 'Desktop' if random.random() < 0.8 else random.choice(devices)
            browser = 'Unknown' if random.random() < 0.4 else random.choice(browsers)
            login_time = random.choice([0, 1, 2, 3, 4, 5]) # Bots usually attack at night
            unknown_device = 1
        else:
            failed_attempts = random.randint(0, 2)
            country = random.choice(['US', 'UK', 'IN', 'DE']) if random.random() < 0.8 else random.choice(countries)
            device = random.choice(devices)
            browser = random.choice(['Chrome', 'Safari', 'Firefox'])
            login_time = random.randint(6, 23)
            unknown_device = 1 if random.random() < 0.1 else 0

        data.append({
            'failed_attempts': failed_attempts,
            'country': country,
            'device': device,
            'browser': browser,
            'login_time': login_time,
            'unknown_device': unknown_device,
            'is_malicious': is_malicious
        })

    return pd.DataFrame(data)

def train_and_save_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data(15000)

    # Encode categorical features
    print("Encoding categorical features...")
    encoders = {}
    categorical_cols = ['country', 'device', 'browser']
    
    for col in categorical_cols:
        le = LabelEncoder()
        # Add 'Unknown' to classes in case it appears in inference but not training
        df[col] = df[col].astype(str)
        unique_vals = list(df[col].unique())
        if 'Unknown' not in unique_vals:
            unique_vals.append('Unknown')
            
        le.fit(unique_vals)
        df[col] = le.transform(df[col])
        encoders[col] = le

    X = df.drop('is_malicious', axis=1)
    y = df['is_malicious']

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    print(f"Model accuracy on training set: {model.score(X, y):.4f}")

    # Ensure ml_models directory exists
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
    os.makedirs(models_dir, exist_ok=True)

    # Save models
    model_path = os.path.join(models_dir, 'rf_model.joblib')
    encoders_path = os.path.join(models_dir, 'encoders.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(encoders, encoders_path)
    
    print(f"Model saved to {model_path}")
    print(f"Encoders saved to {encoders_path}")

if __name__ == '__main__':
    train_and_save_model()
