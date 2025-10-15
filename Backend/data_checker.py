import pandas as pd
import numpy as np

# --- This script will diagnose the CSV file ---

try:
    # 1. Load the dataset as-is
    data = pd.read_csv('heart_disease_uci.csv')
    print("--- 1. Initial Data Report ---")
    print("Successfully loaded 'heart_disease_uci.csv'.")
    print("\nFirst 5 rows of the raw data:")
    print(data.head())
    print("\nColumn data types and non-null counts:")
    data.info()
    
    # 2. Attempt to clean the data
    # Define the columns we expect to use
    feature_cols = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalch',
        'exang', 'oldpeak', 'slope', 'ca', 'thal'
    ]
    
    # Replace placeholder '?' with NaN
    data.replace('?', np.nan, inplace=True)
    
    # Convert feature columns to numeric
    for col in feature_cols:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col], errors='coerce')
        else:
            print(f"\nWARNING: Column '{col}' not found in CSV file!")

    # 3. Final Report on Missing Values
    print("\n\n--- 2. Final Report After Cleaning Attempt ---")
    print("This report shows how many values are MISSING in each column.")
    print("If a column shows a large number of missing values, it's being corrupted.\n")
    
    # Calculate and print the number of null (missing) values in each column
    missing_values = data.isnull().sum()
    print(missing_values)

except FileNotFoundError:
    print("Error: 'heart_disease_uci.csv' not found. Make sure the dataset is in the 'backend' folder.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")