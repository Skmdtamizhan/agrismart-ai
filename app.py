"""AgriSmart AI - Intelligent Crop Recommendation & Precision Farming Web Application.
Launch: python app.py
Access: http://localhost:8501
"""
import sys
import os
import webbrowser
import threading
import time
from pathlib import Path

# Ensure UTF-8 console output on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Paths setup
ROOT_DIR = Path(__file__).resolve().parent
WEBAPP_DIR = ROOT_DIR / "webapp"
CROP_AI_DIR = ROOT_DIR / "crop_ai"
OUTPUTS_DIR = CROP_AI_DIR / "outputs"

sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(WEBAPP_DIR))
sys.path.insert(0, str(CROP_AI_DIR))

import server

def open_browser(port):
    time.sleep(1.2)
    url = f"http://localhost:{port}"
    print(f"  🌐 Opening browser at: {url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    print("""
  ========================================================================
    AgriSmart AI(TM) - Precision Crop Advisory & Farming Platform
  ========================================================================
    * 32 Major Crops Supported (Cereals, Pulses, Cash Crops, Fruits, Veggies)
    * Ensemble AI Machine Learning with 94.7%+ Benchmark Accuracy
    * Soil Health Doctor & Chemical/Organic Fertilizer Calculator
    * Plant Disease Diagnosis & Treatment Engine (20+ Diseases)
    * Beginner Soil & Region Wizard (Zero-Lab-Test Baseline)
    * 120-Day Chronological Farming Lifecycle Roadmap
    * Farm Financial ROI & Net Profit Margin Estimator
    * Real-Time Agricultural Weather & Safe Spray Window Advisory
    * Mandi Wholesale Market Prices & Govt MSP Benchmarks
    * Central & State Welfare Schemes & Subsidy Application Direct Links
    * Kisan Mitra AI Conversational Agronomist (Multilingual + Voice)
    * Printable Official Soil Health Card & PDF Export
  ========================================================================
    """)

    port = 8501
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    # Launch browser in a background thread
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    # Start Server
    server.run_server(port=port)

if __name__ == "__main__":
    main()