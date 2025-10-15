from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the trained artifacts
model = joblib.load('heart_disease_model.pkl')
scaler = joblib.load('scaler.pkl')
imputer = joblib.load('imputer.pkl')

# Define the feature names in the exact order the model was trained on
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalch',
    'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Create a DataFrame from the input data with the correct column order
        input_df = pd.DataFrame([data], columns=feature_names)
        
        # Ensure all data is numeric, as it comes from the form
        input_df = input_df.apply(pd.to_numeric, errors='coerce')

        # Preprocessing Pipeline
        imputed_features = imputer.transform(input_df)
        scaled_features = scaler.transform(imputed_features)
        
        # Make Prediction
        prediction = model.predict(scaled_features)
        
        return jsonify({'prediction': int(prediction[0])})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)