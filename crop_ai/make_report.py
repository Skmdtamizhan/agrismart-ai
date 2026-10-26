"""Automated PDF Project & Agronomic Report Generator."""
import json
from pathlib import Path
import os
import tempfile

os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer, Image, PageBreak, SimpleDocTemplate

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"

def generate_pdf_report():
    summary_file = OUTPUT_DIR / "summary.json"
    if not summary_file.exists():
        print("summary.json not found. Run main.py first.")
        return

    with open(summary_file, "r", encoding="utf-8") as f:
        S = json.load(f)

    st = getSampleStyleSheet()
    p = S["prep"]
    H1 = ParagraphStyle("h", parent=st["Heading1"], fontSize=14, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor("#065f46"))
    B = ParagraphStyle("b", parent=st["Normal"], fontSize=10, leading=14, alignment=4)
    Sm = ParagraphStyle("s", parent=B, fontSize=8.5, leading=11, alignment=0)
    C = ParagraphStyle("c", parent=st["Normal"], fontSize=9, alignment=1, spaceAfter=8, textColor=colors.dimgrey)
    P = lambda x, s=B: Paragraph(x, s)

    def tb(rows, w):
        t = Table(rows, colWidths=w)
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")
        ]))
        return t

    wf = Table([["Soil & Climate Data", ">", "Preprocessing & Imputation", ">", "Ensemble AI / ML", ">", "Crop & Fertilizer Advisory"]],
               colWidths=[3.6 * cm, 0.6 * cm, 4.4 * cm, 0.6 * cm, 3.6 * cm, 0.6 * cm, 4.2 * cm], rowHeights=[1.0 * cm])
    wf.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.8, colors.HexColor("#059669")),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#ecfdf5")),
        ("BACKGROUND", (2, 0), (2, 0), colors.HexColor("#ecfdf5")),
        ("BACKGROUND", (4, 0), (4, 0), colors.HexColor("#ecfdf5")),
        ("BACKGROUND", (6, 0), (6, 0), colors.HexColor("#ecfdf5")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold")
    ]))

    story = [
        Paragraph("AgriSmart AI: Crop Recommendation & Precision Advisory System", st["Title"]),
        Paragraph("College Engineering & Data Science Project - Comprehensive Report", C),
        Spacer(1, 8),
        Paragraph("1. Executive Summary", H1),
        P("Selecting inappropriate crops or mismanaging chemical fertilizers degrades soil health, squanders capital, and drastically lowers crop yield. This platform applies supervised ensemble machine learning to analyze N, P, K soil macronutrients, pH, ambient temperature, humidity, and rainfall to prescribe high-probability crop matches and tailored fertilizer schedules."),
        Spacer(1, 8),
        Paragraph("2. AI Implementation Workflow", H1),
        wf,
        Paragraph("Fig 1: Machine Learning & Agronomic Advisory Pipeline", C),
        Spacer(1, 6),
        tb([
            [P("<b>Stage</b>"), P("<b>Implementation Details</b>")],
            [P("Data"), P(f"{p['raw_rows']} records across {p.get('classes', 26)} crops. Input features: N, P, K (kg/ha), temperature (°C), relative humidity (%), soil pH, and rainfall (mm).")],
            [P("Processing"), P(f"Deduplication, percentile clipping, median imputation of {p['missing']} missing values, standard scaling, and stratified split ({p['train']} train / {p['test']} test).")],
            [P("AI / ML"), P("Benchmarked Random Forest, Extra Trees, KNN, and Gaussian Naive Bayes using 5-fold stratified cross-validation.")],
            [P("Output"), P("Multi-class probabilistic ranking, macronutrient deficit calculator, pH neutralization recommendations, and exportable farm advisory.")]
        ], [3.2 * cm, 13.8 * cm]),
        Spacer(1, 10),
        Paragraph("3. Model Benchmark & Results", H1),
        tb([["Model Candidate", "5-Fold CV Accuracy", "Held-out Test Accuracy"]] + [
            [k, f"{v['cv']*100:.2f}%", f"{v['test']*100:.2f}%"] for k, v in S["scores"].items()
        ], [6.5 * cm, 5.2 * cm, 5.3 * cm]),
        Spacer(1, 6),
        P(f"Optimal Classifier: <b>{S['best']}</b> with <b>{S['scores'][S['best']]['test']*100:.2f}%</b> accuracy."),
        Spacer(1, 10)
    ]

    model_comp_img = OUTPUT_DIR / "model_comparison.png"
    if model_comp_img.exists():
        story.append(Image(str(model_comp_img), width=12 * cm, height=12 * cm * 4.2 / 7.0))
        story.append(Paragraph("Fig 2: Model Comparison (Cross-Validation vs Test Set)", C))

    story.append(PageBreak())

    feat_imp_img = OUTPUT_DIR / "feature_importance.png"
    if feat_imp_img.exists():
        story.append(Paragraph("4. Agronomic Feature Importance", H1))
        story.append(P("Feature importance analysis identifies which environmental and soil parameters contribute most strongly to crop classification decisions."))
        story.append(Spacer(1, 6))
        story.append(Image(str(feat_imp_img), width=12 * cm, height=12 * cm * 3.8 / 6.8))
        story.append(Paragraph("Fig 3: Feature Importance Analysis (Gini Impurity Metric)", C))

    cm_img = OUTPUT_DIR / "confusion_matrix.png"
    if cm_img.exists():
        story.append(Spacer(1, 10))
        story.append(Paragraph("5. Confusion Matrix", H1))
        story.append(Image(str(cm_img), width=13 * cm, height=13 * cm * 7.5 / 8.5))
        story.append(Paragraph("Fig 4: Multi-Class Confusion Matrix", C))

    story.append(PageBreak())
    story.append(Paragraph("6. Real-World Field Evaluation & Recommendations", H1))

    demo_rows = [[P("<b>Field Scenario</b>"), P("<b>Top Ranked Crops</b>"), P("<b>Precision Soil Advisory</b>")]]
    for k, v in S["demo"].items():
        top_str = ", ".join(f"{c['crop']} ({c['confidence']:.0f}%)" for c in v["ranked"][:3])
        demo_rows.append([P(f"<b>{k}</b>", Sm), P(top_str, Sm), P(v["advice"], Sm)])

    story.append(tb(demo_rows, [3.8 * cm, 5.2 * cm, 8.0 * cm]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("7. Deployment & Real-World Utility for Farmers", H1))
    story.append(P("The upgraded AgriSmart AI system bridges theoretical machine learning with actionable farm management. By incorporating beginner farmer soil wizards, crop life-cycle roadmaps, economic ROI estimation, live weather spray advisories, and multi-lingual voice accessibility, the application addresses the actual challenges faced by both novice and experienced agriculturists."))

    doc = SimpleDocTemplate(str(OUTPUT_DIR / "Project_Report.pdf"), pagesize=A4, topMargin=1.8 * cm, bottomMargin=1.8 * cm)
    doc.build(story)
    print(f"Generated PDF report: {OUTPUT_DIR / 'Project_Report.pdf'}")

if __name__ == "__main__":
    generate_pdf_report()