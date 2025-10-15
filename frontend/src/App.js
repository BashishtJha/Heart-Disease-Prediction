import React, { useState, useCallback, useMemo, useEffect } from 'react';

// --- Reusable Components (No changes needed here) ---

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Header = () => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold">Heart Disease Prediction</h1>
    <p className="text-pink-200 mt-2">Enter patient details to predict heart disease probability</p>
  </div>
);

const FormField = ({ name, placeholder, value, onChange, error }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-blue-200 mb-2">{placeholder}</label>
    <input
      type="number"
      step="any"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className={`p-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-blue-400'}`}
    />
    {error && <p className="text-red-400 text-xs mt-1 animate-pulse">{error}</p>}
  </div>
);

const ResultDisplay = ({ prediction, apiError }) => (
  <div className={`transition-all duration-500 ease-in-out mt-8 ${prediction !== null || apiError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0'}`}>
    {apiError && (
      <div className="p-4 rounded-lg text-center font-bold text-lg bg-yellow-500/20 text-orange-300 border border-yellow-500">
        <p>Error: {apiError}</p>
      </div>
    )}
    {prediction !== null && (
      <div className={`p-6 rounded-xl text-center font-bold text-xl border ${prediction === 1 ? 'bg-red-500/20 text-red-300 border-red-500' : 'bg-green-500/20 text-green-300 border-green-500'}`}>
        <h2 className="text-2xl mb-2">{prediction === 1 ? 'Heart Disease Detected' : 'No Heart Disease Detected'}</h2>
        <p className="text-base font-normal">{prediction === 1 ? 'Further consultation with a specialist is highly recommended.' : 'The model indicates a low probability of heart disease.'}</p>
      </div>
    )}
  </div>
);


// --- Main App Component ---

function App() {
  const [formData, setFormData] = useState({
    age: '58', sex: '0', cp: '0', trestbps: '100', chol: '248', fbs: '0',
    restecg: '0', thalach: '122', exang: '0', oldpeak: '1', slope: '1',
    ca: '0', thal: '2'
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  // --- Input Validation Rules ---
  const validationRules = useMemo(() => ({
    age: { min: 1, max: 120, message: "Age must be between 1 and 120." },
    sex: { allowed: [0, 1], message: "Sex must be 0 (Female) or 1 (Male)." },
    cp: { allowed: [0, 1, 2, 3], message: "Chest Pain type must be 0-3." },
    trestbps: { min: 80, max: 220, message: "BP must be between 80 and 220." },
    chol: { min: 100, max: 600, message: "Cholesterol must be 100-600." },
    fbs: { allowed: [0, 1], message: "Fasting Blood Sugar must be 0 or 1." },
    restecg: { allowed: [0, 1, 2], message: "Resting ECG must be 0, 1, or 2." },
    thalach: { min: 60, max: 220, message: "Max Heart Rate must be 60-220." },
    exang: { allowed: [0, 1], message: "Exercise Angina must be 0 or 1." },
    oldpeak: { min: 0, max: 10, message: "Oldpeak must be between 0 and 10." },
    slope: { allowed: [0, 1, 2], message: "Slope must be 0, 1, or 2." },
    ca: { allowed: [0, 1, 2, 3], message: "CA must be between 0 and 3." },
    thal: { allowed: [0, 1, 2, 3], message: "Thal must be between 0 and 3." },
  }), []);

  // --- More Robust Validation Logic ---
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    // This clears the error when the user deletes the input
    if (value.trim() === '') return null;

    const numValue = Number(value);
    if (isNaN(numValue)) return "Must be a valid number.";

    if (rule.min !== undefined && numValue < rule.min) return rule.message;
    if (rule.max !== undefined && numValue > rule.max) return rule.message;
    if (rule.allowed && !rule.allowed.includes(numValue)) return rule.message;
    
    return null; // No error
  }, [validationRules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Set form data first
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Then validate and set the error state
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };
  
  // --- Diagnostic Tool: Log errors to the console ---
  useEffect(() => {
    console.log("Current validation errors:", errors);
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some(error => error !== null)) {
      alert("Please fix the errors before submitting.");
      return;
    }
    // (rest of the submit logic is unchanged)
    setPrediction(null);
    setApiError('');
    setIsLoading(true);
    const body = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, Number(value)])
    );
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.error) setApiError(data.error);
      else setPrediction(data.prediction);
    } catch (err) {
      setApiError('Failed to fetch prediction. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = useMemo(() => [
    { name: 'age', placeholder: 'Age' }, { name: 'sex', placeholder: 'Sex (1=M, 0=F)' },
    { name: 'cp', placeholder: 'Chest Pain Type (0-3)' }, { name: 'trestbps', placeholder: 'Resting Blood Pressure' },
    { name: 'chol', placeholder: 'Serum Cholesterol (mg/dl)' }, { name: 'fbs', placeholder: 'Fasting Blood Sugar > 120 (1=T, 0=F)' },
    { name: 'restecg', placeholder: 'Resting ECG (0-2)' }, { name: 'thalach', placeholder: 'Max Heart Rate Achieved' },
    { name: 'exang', placeholder: 'Exercise Induced Angina (1=Y, 0=N)' }, { name: 'oldpeak', placeholder: 'Oldpeak' },
    { name: 'slope', placeholder: 'Slope of ST Segment' }, { name: 'ca', placeholder: 'Major Vessels Colored (0-3)' },
    { name: 'thal', placeholder: 'Thal (1=N, 2=Fixed, 3=Rev)' },
  ], []);

  const hasErrors = Object.values(errors).some(error => error !== null);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen flex items-center justify-center font-sans text-yellow-300 p-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <Header />
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inputFields.map(field => (
            <FormField
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              error={errors[field.name]}
            />
          ))}
          <button 
            type="submit" 
            disabled={isLoading || hasErrors}
            className="md:col-span-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold py-4 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center text-lg mt-4"
          >
            {isLoading ? <Spinner /> : 'Submit For Prediction'}
            {isLoading && <span>Analyzing...</span>}
          </button>
        </form>
        <ResultDisplay prediction={prediction} apiError={apiError} />
      </div>
    </div>
  );
}

export default App;