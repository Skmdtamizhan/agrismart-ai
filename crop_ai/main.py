"""AI-Based Crop Recommendation & Precision Fertilizer Advisory System
Workflow: Data -> Processing -> AI/ML -> Output
Enhanced for 26+ agricultural crops with Explainable Agronomy.
"""
import json
import os
import tempfile
from pathlib import Path

# Safe Matplotlib cache directory
os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()
import joblib

from stage1_data import load_data
from stage2_processing import process
from stage3_model import train
from stage4_output import make_outputs, recommend

PROJECT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = PROJECT_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def run_pipeline():
    print("=" * 65)
    print("      AgriSmart AI - Intelligent Crop Recommendation Pipeline      ")
    print("=" * 65)

    print("\n[1/4] DATA       : Loading comprehensive 26-crop agricultural dataset...")
    df = load_data()
    print(f"      Loaded {len(df)} records across {df['crop'].nunique()} distinct crops.")

    print("\n[2/4] PROCESSING : Deduplication, Outlier clipping, Median Imputation, Scaling...")
    Xtr, Xte, ytr, yte, sc, le, prep, imputer = process(df)
    print(f"      Train Samples: {prep['train']} | Test Samples: {prep['test']} | Clean Rows: {prep['clean_rows']}")

    print("\n[3/4] AI / ML    : Benchmarking Classifiers (Random Forest, Extra Trees, KNN, Naive Bayes)...")
    model, best, scores = train(Xtr, Xte, ytr, yte)
    for k, v in scores.items():
        print(f"      {k:22s} -> 5-Fold CV: {v['cv']*100:.2f}% | Test Acc: {v['test']*100:.2f}%")
    print(f"      >>> Selected Best Model: {best} ({scores[best]['test']*100:.2f}% accuracy)")

    print("\n[4/4] OUTPUT     : Generating Visualizations & Model Artifacts...")
    make_outputs(model, best, scores, Xte, yte, le, out=str(OUTPUT_DIR))

    # Persist model bundle
    bundle = {
        "model": model,
        "scaler": sc,
        "label_encoder": le,
        "imputer": imputer,
        "best_name": best,
        "scores": scores,
        "classes": list(le.classes_)
    }
    joblib.dump(bundle, OUTPUT_DIR / "crop_model.joblib")
    print(f"      Saved model bundle to {OUTPUT_DIR / 'crop_model.joblib'}")

    # Run Demonstration on sample fields
    sample_fields = {
        "Field 1 - Punjab Indo-Gangetic Alluvial": {
            "N": 75, "P": 44, "K": 36, "temperature": 18.5, "humidity": 56.0, "ph": 6.8, "rainfall": 72.0
        },
        "Field 2 - Maharashtra Black Cotton Soil": {
            "N": 115, "P": 45, "K": 22, "temperature": 25.0, "humidity": 78.0, "ph": 7.0, "rainfall": 82.0
        },
        "Field 3 - Coastal Karnataka Horticultural Land": {
            "N": 98, "P": 78, "K": 48, "temperature": 27.5, "humidity": 82.0, "ph": 6.1, "rainfall": 110.0
        },
        "Field 4 - Arid Rajasthan Sandy Soil": {
            "N": 42, "P": 24, "K": 21, "temperature": 31.0, "humidity": 42.0, "ph": 7.4, "rainfall": 45.0
        }
    }

    demo_results = {}
    print("\n--- SAMPLE FIELD DEMONSTRATIONS ---")
    for name, f in sample_fields.items():
        rec = recommend(model, sc, le, f, imputer=imputer)
        demo_results[name] = {"input": f, **rec}
        ranked_str = ", ".join(f"{c} ({p:.1f}%)" for c, p in [(r["crop"], r["confidence"]) for r in rec["ranked"]])
        print(f"\n{name}:\n  Recommended Crops : {ranked_str}\n  Fertilizer Advice : {rec['advice']}")

    summary_data = {
        "prep": prep,
        "scores": scores,
        "best": best,
        "demo": demo_results
    }
    with open(OUTPUT_DIR / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)

    print("\n" + "=" * 65)
    print("Pipeline completed successfully! Summary saved to outputs/summary.json")
    print("=" * 65)

if __name__ == "__main__":
    run_pipeline()