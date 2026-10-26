# AI-Based Crop Recommendation & Fertilizer Advisory System
Workflow: **Data -> Processing -> AI/ML -> Output**
- stage1_data.py: soil (N, P, K, pH) + climate (temperature, humidity, rainfall) for 8 crops
- stage2_processing.py: dedupe, clip outliers, impute, scale, stratified split
- stage3_model.py: Naive Bayes, KNN, Random Forest; best model kept
- stage4_output.py: top-3 crop recommendation, fertilizer advice, charts
Run: pip install -r requirements.txt && python main.py
