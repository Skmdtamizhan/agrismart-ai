# 🌱 AgriSmart AI™ — Intelligent Crop Intelligence & Precision Farming Platform

[![Python Version](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-059669.svg)](https://python.org)
[![Accuracy](https://img.shields.io/badge/ML%20Accuracy-94.7%25%20(32%20Crops)-10b981.svg)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-0284c7.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![UI/UX](https://img.shields.io/badge/UI%2FUX-Superb%20Sleek%20Emerald-047857.svg)](#)

> **AgriSmart AI** is a comprehensive, production-ready agricultural decision platform designed for both **new/beginner farmers** and **experienced agriculturists**. It combines supervised ensemble machine learning, precision agronomy, plant disease diagnosis, farm budgeting, live meteorological forecasting, and voice AI assistance into a deployable interactive web application with a sleek, responsive UI/UX.

---

## 📸 Core Capabilities & Features

### 1. 🌾 AI Multi-Crop Recommendation Engine
- **32 Agricultural Crops Supported:** Cereals (*Rice, Wheat, Maize, Barley, Millets*), Pulses (*Chickpea, Kidney Beans, Pigeon Peas, Lentil, Black Gram, Mung Bean*), Commercial/Cash crops (*Cotton, Sugarcane, Jute, Coffee, Tea*), Oilseeds (*Groundnut, Mustard, Soybean*), and Fruits/Vegetables (*Banana, Mango, Grapes, Apple, Orange, Papaya, Pomegranate, Watermelon, Coconut, Tomato, Potato, Onion*).
- **Ensemble Supervised Learning:** Benchmarked with Random Forest, Extra Trees, KNN, and Gaussian Naive Bayes with **94.7%** cross-validated test accuracy.
- **Explainable Agronomy:** Returns ranked Top-3 crops with confidence percentages and agronomic match reasoning (*soil pH, rainfall tolerance, thermal thresholds*).
- **1-Click Field Presets:** Instant loading for Punjab Alluvial Wheat, Maharashtra Black Soil Cotton, Bengal Delta Paddy, Karnataka Horticulture, and Rajasthan Arid Belts.

### 2. 🧪 Precision Soil & Fertilizer Doctor
- **Exact N-P-K Deficit Calculator:** Automatically detects soil nutrient deficits against target crop benchmarks.
- **Commercial Fertilizer Prescriptions:** Calculates exact commercial bag dosages (per acre or hectare):
  - **Urea (46% N)** with multi-split application timing
  - **DAP (18% N, 46% P₂O₅)** and **SSP (16% P₂O₅)** basal doses
  - **MOP (Muriate of Potash - 60% K₂O)** for flowering and grain weight
  - **Micronutrients:** Zinc Sulfate, Ferrous Sulfate, Borax
- **Soil pH Neutralization:** Recommends Agricultural Lime (CaCO₃) for acidic soils (< 6.0) and Gypsum (CaSO₄) for alkaline/saline soils (> 7.5).
- **Organic Enrichment Protocol:** Formulates guidelines for Vermicompost, Farm Yard Manure (FYM), Neem cake (nematode control), and Biofertilizers (*Azotobacter, Rhizobium, PSB*).

### 3. 🩺 AI Plant Disease Diagnostic Doctor
- **20+ Crop Diseases & Sucking Pests:** Diagnoses Rice Blast, Wheat Yellow Rust, Cotton Pink Bollworm, Tomato Early/Late Blight, Potato Blight, Banana Sigatoka, Sugarcane Red Rot, Maize Fall Armyworm, Aphids & Whiteflies.
- **Full Action Plan:** Severity grading (Low/Moderate/High/Severe), Immediate containment protocols, Organic/Bio-control remedies (*Neem oil 10,000 ppm, Trichoderma viride, Bacillus thuringiensis*), Chemical fungicide/insecticide dilutions (g/L), and Cultural prevention.

### 4. 🧙 Beginner Farmer Soil & Region Wizard
- Designed specifically for farmers who do not have laboratory soil test reports.
- Select from standard soil textures (*Alluvial, Black Cotton, Red & Yellow, Laterite, Sandy Loam, Clay Loam*) and cropping seasons (*Kharif, Rabi, Zaid*).
- Auto-populates scientifically calibrated baseline N-P-K, pH, and climate parameters to generate immediate recommendations.

### 5. 📅 120-Day Chronological Farming Lifecycle Roadmap
- Step-by-step 5-phase farming calendar:
  - **Phase 1:** Land Preparation, Basal Fertilization & Seed Treatment
  - **Phase 2:** Sowing, Germination & Crown Root Initiation (CRI)
  - **Phase 3:** Vegetative Growth, First Top-Dressing & Weed Suppression
  - **Phase 4:** Flowering, Panicle/Boll Initiation & Critical Irrigation
  - **Phase 5:** Maturity, Harvest Moisture Indices & Safe Storage

### 6. 💰 Farm Economics & ROI Profit Estimator
- Interactive financial modeler:
  - Land acreage input (0.25 to 100+ acres)
  - Itemized cost breakdown (Seed, Fertilizer, Labor/Tractor, Irrigation, Pesticides, Harvesting)
  - Expected yield (Quintals/acre) and prevailing market price / MSP
  - Live calculations: **Total Investment**, **Gross Revenue**, **Net Profit**, **ROI %**, and **Break-Even Selling Rate**.

### 7. 🌤️ Live Agricultural Weather & Safe Spray Window
- Real-time weather integration via Open-Meteo API (free, open, works globally).
- Real-time Temperature, Humidity, Wind speed, and Rainfall.
- **Smart Spray Advisory:** Dynamically checks if conditions are safe for foliar spraying (wind < 15 km/h, no rain within 6 hours).
- **Fungal Alert:** Warns farmers when sustained humidity (> 80%) creates fungal spore outbreaks.

### 8. 📊 Mandi Prices & MSP Tracker
- Live wholesale rates across major agricultural commodities with Government Minimum Support Prices (MSP), 7-day trend indicators, and strategic selling advisories.

### 9. 🏛️ Central & State Government Welfare Schemes
- Direct application guide, eligibility criteria, and portal links:
  - **PM-KISAN** (₹6,000/yr direct income transfer)
  - **PM Fasal Bima Yojana** (Low-cost crop insurance: 1.5% - 2% premium)
  - **PM Krishi Sinchayee Yojana** (55% - 70% Drip/Sprinkler subsidy)
  - **Kisan Credit Card (KCC)** (Subsidized farm credit up to ₹3 Lakh @ 4% interest)
  - **SMAM** (40% - 50% capital subsidy on tractors & implements)
  - **PKVY** (₹50,000/ha assistance for organic farming adoption)

### 10. 🤖 Kisan Mitra Voice AI Agronomist
- Conversational agronomist assistant with natural domain knowledge.
- **Voice Speech-to-Text:** Click microphone button to dictate questions.
- **Voice Audio Readout:** Natural SpeechSynthesis voice reading.
- **Multilingual Support:** English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ), Telugu (తెలుగు), Marathi (मराठी), and Tamil (தமிழ்).

### 11. 📄 Printable Official Soil Health Card
- Generates an official-looking Soil Health Card & Farm Advisory with 1-click Print / PDF save.

---

## 🚀 Quick Start Guide

### Option A: 1-Click Launch (Windows)
Double-click:
```bat
start.bat
```
*(Or run `.\start.ps1` in PowerShell)*

### Option B: Terminal Command
```bash
# 1. Activate virtual environment (if available)
.venv\Scripts\activate

# 2. Run the application
python app.py
```
Open your browser to: **`http://localhost:8501`**

---

## 🐳 Docker Deployment

Build and run with a single command:
```bash
docker compose up --build
```
Or with docker CLI:
```bash
docker build -t agrismart-ai .
docker run -p 8501:8501 agrismart-ai
```

---

## ☁️ Cloud Deployment (Render / Railway / Hugging Face Spaces)

This project is configured out-of-the-box for cloud hosting:
- **Render:** Connect your Git repository; `render.yaml` automatically sets up the build and start commands.
- **Railway / Heroku:** The included `Procfile` (`web: python app.py ${PORT:-8501}`) starts the server automatically.
- **Hugging Face Spaces:** Choose Docker or Python SDK template.

---

## 📁 Project Architecture

```
d:\CLG FILES\crop_ai_project\
├── app.py                     # Root launcher (opens browser + starts server)
├── start.bat                  # 1-Click Windows execution
├── start.ps1                  # 1-Click PowerShell execution
├── start.sh                   # 1-Click Linux / macOS execution
├── requirements.txt           # Unified pinned dependencies
├── Dockerfile                 # Multi-stage production container
├── docker-compose.yml         # Container orchestration
├── render.yaml                # Render cloud deployment config
├── Procfile                   # Heroku / Railway web process
│
├── webapp\                    # Deployable Interactive Web Application
│   ├── server.py              # Multi-threaded HTTP & REST API server
│   ├── api.py                 # Core business logic & agronomic algorithms
│   ├── templates\
│   │   └── index.html         # Superb sleek responsive UI dashboard
│   └── static\
│       ├── css\style.css      # Modern emerald & slate design system
│       └── js\app.js          # Client router, voice AI, live weather, calculators
│
└── crop_ai\                   # ML Core Pipeline
    ├── stage1_data.py         # 32-crop dataset generator with ICAR/FAO centroids
    ├── stage2_processing.py   # Median imputation, scaling, outlier clipping
    ├── stage3_model.py        # RF, Extra Trees, KNN, Naive Bayes benchmark
    ├── stage4_output.py       # Top-3 predictions, charts, fertilizer calculations
    ├── make_report.py         # ReportLab automated PDF project report
    ├── main.py                # Pipeline trainer & demonstration script
    ├── data\
    │   └── crop_dataset.csv   # 3,840 records across 32 crops
    └── outputs\
        ├── crop_model.joblib  # Serialized model, scaler, encoder & imputer
        ├── summary.json       # Benchmark metrics & demonstration outputs
        ├── Project_Report.pdf # Formatted scientific report
        ├── model_comparison.png
        ├── feature_importance.png
        └── confusion_matrix.png
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/recommend` | Runs ML model, returns ranked crops & fertilizer advisory |
| `POST` | `/api/soil_wizard` | Estimates baseline soil & climate parameters |
| `POST` | `/api/diagnose` | Evaluates disease symptoms, returns remedies & dosages |
| `POST` | `/api/crop_calendar`| Returns 120-day phase-by-phase roadmap |
| `POST` | `/api/roi` | Computes financial investment, net profit, and ROI % |
| `POST` | `/api/chat` | Kisan Mitra conversational AI agronomist responses |
| `GET` | `/api/weather` | Live microclimate & safe spray window advisory |
| `GET` | `/api/presets` | Quick 1-click regional field presets |
| `GET` | `/api/diseases` | Full database of 20+ plant diseases and treatments |
| `GET` | `/api/mandi` | Live wholesale commodity rates and MSP benchmarks |
| `GET` | `/api/schemes` | Central & State agricultural subsidy programs |
| `GET` | `/api/model_info` | Model evaluation metrics and accuracy summary |

---

## 👨‍🌾 Designed for Real Farmers & Agronomists
Created to bridge scientific data science with on-field practical agriculture.