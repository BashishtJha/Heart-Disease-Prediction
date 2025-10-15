import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load the dataset
try:
    data = pd.read_csv('heart_disease_uci.csv')
except FileNotFoundError:
    print("Error: 'heart_disease_uci.csv' not found.")
    exit()

# 2. Define the exact feature columns we need
feature_cols = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalch',
    'exang', 'oldpeak', 'slope', 'ca', 'thal'
]
target_col = 'num'
df = data[feature_cols + [target_col]].copy()

# 3. --- FINAL, CORRECTED DATA CLEANING AND MAPPING ---
# These mappings now exactly match the text from your CSV sample.
df.loc[:, 'sex'] = df['sex'].map({'Male': 1, 'Female': 0})
df.loc[:, 'cp'] = df['cp'].map({'typical angina': 0, 'atypical angina': 1, 'non-anginal': 2, 'asymptomatic': 3})
# Your data uses TRUE/FALSE booleans, which we map to 1/0
df.loc[:, 'fbs'] = df['fbs'].replace({True: 1, False: 0})
df.loc[:, 'restecg'] = df['restecg'].map({'normal': 0, 'st-t wave abnormality': 1, 'lv hypertrophy': 2})
df.loc[:, 'exang'] = df['exang'].replace({True: 1, False: 0})
df.loc[:, 'slope'] = df['slope'].map({'upsloping': 0, 'flat': 1, 'downsloping': 2})
# Note the spelling correction to "reversable defect"
df.loc[:, 'thal'] = df['thal'].map({'normal': 1, 'fixed defect': 2, 'reversable defect': 3})

# Replace any lingering placeholders like '?' and convert all to numeric
df.replace('?', np.nan, inplace=True)
df = df.apply(pd.to_numeric, errors='coerce')

# Convert target column to binary
df.loc[:, target_col] = df[target_col].apply(lambda x: 1 if x > 0 else 0)

# 4. Final data preparation
X = df[feature_cols]
y = df[target_col]

# Check for remaining issues
if X.isnull().sum().sum() > 0:
    print("Warning: Missing values still exist after cleaning. Imputer will handle them.")

# 5. Split, Impute, Scale, and Train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

imputer = SimpleImputer(strategy='mean')
X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

print(f"Final model trained with accuracy: {model.score(X_test_scaled, y_test):.4f}")

# 6. Save final artifacts
joblib.dump(model, 'heart_disease_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(imputer, 'imputer.pkl')

print("Final artifacts saved successfully. The model is ready.")