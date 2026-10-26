"""STAGE 4 - OUTPUT: Top-ranked crop recommendations, precision fertilizer calculations, charts."""
from pathlib import Path
import os
import tempfile
import numpy as np
import pandas as pd

# Safe Matplotlib configuration to prevent permission issues
os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

from stage1_data import FEATURES, PROFILE

def make_outputs(model, best, scores, Xte, yte, le, out="outputs"):
    out_path = Path(out)
    out_path.mkdir(parents=True, exist_ok=True)

    pred = model.predict(Xte)
    report_text = f"AgriSmart AI Model Evaluation Report\nBest Performing Model: {best}\n\n"
    report_text += classification_report(yte, pred, target_names=le.classes_, digits=3)
    (out_path / "classification_report.txt").write_text(report_text, encoding="utf-8")

    # 1. Model comparison chart
    fig, ax = plt.subplots(figsize=(7, 4.2))
    names = list(scores.keys())
    cv_accs = [scores[k]["cv"] * 100 for k in names]
    test_accs = [scores[k]["test"] * 100 for k in names]

    x = np.arange(len(names))
    width = 0.35
    ax.bar(x - width/2, cv_accs, width, label="5-Fold CV Acc (%)", color="#6ee7b7")
    ax.bar(x + width/2, test_accs, width, label="Test Acc (%)", color="#059669")
    ax.set_ylim(85, 102)
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Machine Learning Model Benchmark (AgriSmart AI)", fontsize=12, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=15, ha="right")
    ax.legend()
    for i in range(len(names)):
        ax.text(x[i] + width/2, test_accs[i] + 0.3, f"{test_accs[i]:.1f}%", ha="center", fontsize=9)
    plt.tight_layout()
    plt.savefig(out_path / "model_comparison.png", dpi=150)
    plt.close()

    # 2. Feature importance chart
    if hasattr(model, "feature_importances_"):
        fig, ax = plt.subplots(figsize=(6.8, 3.8))
        importances = pd.Series(model.feature_importances_, index=FEATURES).sort_values()
        importances.plot.barh(ax=ax, color="#10b981", edgecolor="#047857")
        ax.set_title("Agronomic Feature Importance (Gini Index)", fontsize=11, fontweight="bold")
        ax.set_xlabel("Relative Importance")
        plt.tight_layout()
        plt.savefig(out_path / "feature_importance.png", dpi=150)
        plt.close()

    # 3. Compact Confusion Matrix (subset or overall accuracy display)
    fig, ax = plt.subplots(figsize=(8.5, 7.5))
    cm = confusion_matrix(yte, pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.classes_)
    disp.plot(ax=ax, cmap="Greens", colorbar=False, xticks_rotation=60)
    ax.set_title(f"Confusion Matrix ({best})", fontsize=11, fontweight="bold")
    plt.tight_layout()
    plt.savefig(out_path / "confusion_matrix.png", dpi=130)
    plt.close()

def fertilizer_advice(crop, field):
    """
    Computes precision fertilizer advice based on soil nutrient deficit and crop profile.
    Values calculated per hectare and per acre (1 hectare = 2.47 acres).
    """
    if crop not in PROFILE:
        return {
            "summary": "Target crop profile not in standard catalog.",
            "actions": [],
            "organic": ["Apply 2-3 tons of farmyard manure per acre."],
            "ph_advice": "Maintain soil pH around 6.5."
        }

    opt_n, opt_p, opt_k, _, _, opt_ph, _ = PROFILE[crop]
    cur_n = float(field.get("N", opt_n))
    cur_p = float(field.get("P", opt_p))
    cur_k = float(field.get("K", opt_k))
    cur_ph = float(field.get("ph", 6.5))

    diff_n = opt_n - cur_n
    diff_p = opt_p - cur_p
    diff_k = opt_k - cur_k

    actions = []
    commercial_recommendations = []

    # Nitrogen calculation (Urea is 46% N)
    if diff_n > 5:
        urea_kg_ha = (diff_n / 0.46)
        urea_bags_acre = (urea_kg_ha / 2.47) / 50.0 # 50kg bag
        actions.append(f"Nitrogen Deficit: Soil has {cur_n:.0f} kg/ha (ideal ~{opt_n:.0f}). Add Urea.")
        commercial_recommendations.append({
            "fertilizer": "Urea (46% N)",
            "dosage_per_acre": f"{urea_kg_ha/2.47:.1f} kg/acre ({max(0.2, urea_bags_acre):.1f} bags)",
            "split_timing": "Apply in 2 to 3 split doses (basal + active tillering / vegetative growth)"
        })
    elif diff_n < -15:
        actions.append(f"Nitrogen Excess: Soil has {cur_n:.0f} kg/ha (ideal ~{opt_n:.0f}). Avoid chemical Nitrogen to prevent lodging and pest attacks.")

    # Phosphorus calculation (DAP is 46% P2O5 and 18% N; SSP is 16% P2O5)
    if diff_p > 4:
        dap_kg_ha = (diff_p / 0.46)
        dap_bags_acre = (dap_kg_ha / 2.47) / 50.0
        actions.append(f"Phosphorus Deficit: Soil has {cur_p:.0f} kg/ha (ideal ~{opt_p:.0f}). Add DAP or SSP.")
        commercial_recommendations.append({
            "fertilizer": "DAP (Di-Ammonium Phosphate) or SSP",
            "dosage_per_acre": f"{dap_kg_ha/2.47:.1f} kg/acre ({max(0.2, dap_bags_acre):.1f} bags DAP)",
            "split_timing": "Apply 100% as basal dose during final land preparation before sowing"
        })
    elif diff_p < -15:
        actions.append(f"Phosphorus Excess: Soil has {cur_p:.0f} kg/ha. Withhold phosphate fertilizers.")

    # Potassium calculation (MOP is 60% K2O)
    if diff_k > 5:
        mop_kg_ha = (diff_k / 0.60)
        mop_bags_acre = (mop_kg_ha / 2.47) / 50.0
        actions.append(f"Potassium Deficit: Soil has {cur_k:.0f} kg/ha (ideal ~{opt_k:.0f}). Add MOP.")
        commercial_recommendations.append({
            "fertilizer": "MOP (Muriate of Potash - 60% K2O)",
            "dosage_per_acre": f"{mop_kg_ha/2.47:.1f} kg/acre ({max(0.2, mop_bags_acre):.1f} bags)",
            "split_timing": "Apply 50% basal and 50% at flowering / fruit setting stage"
        })
    elif diff_k < -15:
        actions.append(f"Potassium Sufficient/Excess: Soil has {cur_k:.0f} kg/ha.")

    # Soil pH advisory
    if cur_ph < 5.6:
        ph_status = "Strongly Acidic"
        ph_advice = "Soil pH is acidic. Apply Agricultural Lime (CaCO3) @ 250-350 kg/acre during ploughing to neutralise soil and unlock nutrient availability."
    elif cur_ph < 6.2:
        ph_status = "Moderately Acidic"
        ph_advice = "Soil is mildly acidic. Suitable for most crops; add 2 tonnes of well-rotted farmyard manure (FYM) or compost."
    elif cur_ph <= 7.5:
        ph_status = "Optimal / Neutral"
        ph_advice = "Soil pH is in the optimal range (6.2 - 7.5). Excellent nutrient assimilation capacity."
    elif cur_ph <= 8.3:
        ph_status = "Moderately Alkaline"
        ph_advice = "Soil is moderately alkaline. Apply Gypsum (CaSO4) @ 200 kg/acre and incorporate green manuring (Dhaincha/Sunn hemp)."
    else:
        ph_status = "Strongly Alkaline / Saline"
        ph_advice = "Soil is strongly alkaline (pH > 8.3). Use elemental sulfur (50-80 kg/acre), ensure deep drainage channels, and add organic humic acids."

    organic_options = [
        "Well-decomposed Farm Yard Manure (FYM): 4-5 tonnes/acre",
        "Vermicompost: 1.5-2 tonnes/acre enriched with Trichoderma viride",
        "Biofertilizers: Azotobacter / Rhizobium (for pulses) + PSB (Phosphate Solubilizing Bacteria) @ 2 kg/acre seed or soil treatment",
        "Neem Cake: 150 kg/acre (acts as slow-release organic N and suppresses root-knot nematodes)"
    ]

    summary = "; ".join(actions) if actions else "Soil N-P-K nutrient status is in near-optimal balance for " + crop + "."

    return {
        "summary": summary,
        "actions": actions,
        "commercial": commercial_recommendations,
        "ph_status": ph_status,
        "ph_advice": ph_advice,
        "organic": organic_options,
        "ideal_profile": {
            "N": opt_n, "P": opt_p, "K": opt_k, "pH": opt_ph
        }
    }

def recommend(model, sc, le, field, imputer=None, top_k=3):
    """
    Generate ranked crop recommendations with probability confidence and agronomic reasoning.
    """
    df_in = pd.DataFrame([field])[FEATURES]
    if imputer is not None:
        X_imp = imputer.transform(df_in)
    else:
        X_imp = df_in.values
    X_sc = sc.transform(X_imp)

    probs = model.predict_proba(X_sc)[0]
    top_indices = np.argsort(probs)[::-1][:top_k]

    ranked_crops = []
    for idx in top_indices:
        crop_name = le.classes_[idx]
        conf = float(probs[idx])
        # Agronomic match rationale
        opt = PROFILE.get(crop_name)
        reasons = []
        if opt:
            n, p, k, t, h, ph, r = opt
            if abs(field.get("rainfall", r) - r) < 40:
                reasons.append("Rainfall requirements match field conditions")
            if abs(field.get("temperature", t) - t) < 4:
                reasons.append("Temperature profile is highly favorable")
            if abs(field.get("ph", ph) - ph) < 0.6:
                reasons.append("Soil pH is well-aligned with root physiology")
        match_reason = ", ".join(reasons) if reasons else "Good overall environmental and soil compatibility"

        ranked_crops.append({
            "crop": crop_name,
            "confidence": round(conf * 100, 1),
            "suitability": "High" if conf >= 0.50 else "Moderate" if conf >= 0.20 else "Fair",
            "reason": match_reason
        })

    best_crop = ranked_crops[0]["crop"]
    fert = fertilizer_advice(best_crop, field)

    return {
        "top3": [(item["crop"], item["confidence"] / 100.0) for item in ranked_crops],
        "ranked": ranked_crops,
        "best_crop": best_crop,
        "best_confidence": ranked_crops[0]["confidence"],
        "fertilizer_plan": fert,
        "advice": fert["summary"]
    }