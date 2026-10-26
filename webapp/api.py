"""AgriSmart AI - Core Backend Business Logic & Agronomic Knowledge Engine."""
import sys
import os
import json
from pathlib import Path
import numpy as np

# Add crop_ai directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
CROP_AI_DIR = BASE_DIR / "crop_ai"
OUTPUTS_DIR = CROP_AI_DIR / "outputs"
sys.path.insert(0, str(CROP_AI_DIR))

import joblib
from stage1_data import PROFILE, FEATURES
from stage4_output import fertilizer_advice, recommend

# Global Model Cache
MODEL_BUNDLE = None

def get_model_bundle():
    global MODEL_BUNDLE
    if MODEL_BUNDLE is None:
        bundle_path = OUTPUTS_DIR / "crop_model.joblib"
        if not bundle_path.exists():
            print("Model bundle not found. Training model now...")
            import main
            main.run_pipeline()
        MODEL_BUNDLE = joblib.load(bundle_path)
    return MODEL_BUNDLE

# --- 1. FIELD PRESETS ---
FIELD_PRESETS = [
    {
        "id": "punjab_wheat",
        "name": "🌾 Punjab Indo-Gangetic Plain",
        "desc": "Rich alluvial soil, optimal for winter wheat, mustard, or potato",
        "data": {"N": 76, "P": 44, "K": 36, "temperature": 18.5, "humidity": 55.0, "ph": 6.8, "rainfall": 72.0}
    },
    {
        "id": "maharashtra_cotton",
        "name": "🌱 Maharashtra Deccan Black Soil",
        "desc": "Heavy clayey black soil high in moisture retention, ideal for cotton or soybean",
        "data": {"N": 118, "P": 46, "K": 22, "temperature": 25.5, "humidity": 78.0, "ph": 7.1, "rainfall": 82.0}
    },
    {
        "id": "bengal_paddy",
        "name": "🌾 Bengal & Assam Delta Paddy",
        "desc": "High rainfall, tropical humidity, ideal for rice paddy or jute",
        "data": {"N": 82, "P": 48, "K": 40, "temperature": 26.0, "humidity": 84.0, "ph": 6.3, "rainfall": 230.0}
    },
    {
        "id": "karnataka_horticulture",
        "name": "🍌 Karnataka South Horticultural Belt",
        "desc": "Warm humid conditions, excellent for banana, papaya, or maize",
        "data": {"N": 98, "P": 78, "K": 48, "temperature": 27.0, "humidity": 80.0, "ph": 6.1, "rainfall": 105.0}
    },
    {
        "id": "rajasthan_arid",
        "name": "🏜️ Western Arid Sandy Loam",
        "desc": "Low rainfall, high temperature, suited for drought-resistant Millets (Bajra) or Moth Beans",
        "data": {"N": 42, "P": 24, "K": 20, "temperature": 30.0, "humidity": 44.0, "ph": 7.3, "rainfall": 45.0}
    },
    {
        "id": "himachal_apple",
        "name": "🍎 Sub-Himalayan Hill Orchard",
        "desc": "Cool mountain climate with high potassium and phosphorus, ideal for apple or temperate fruits",
        "data": {"N": 22, "P": 132, "K": 195, "temperature": 21.0, "humidity": 90.0, "ph": 5.9, "rainfall": 115.0}
    }
]

# --- 2. BEGINNER SOIL WIZARD BASELINES ---
SOIL_WIZARD_DATA = {
    "Alluvial Soil": {
        "N": 72, "P": 46, "K": 38, "ph": 6.8,
        "desc": "Found in river plains (Punjab, UP, Bihar, WB). Highly fertile, good porosity, rich in potash but moderate in nitrogen."
    },
    "Black Cotton Soil (Regur)": {
        "N": 110, "P": 45, "K": 24, "ph": 7.4,
        "desc": "Found in Maharashtra, MP, Gujarat. High clay content, swells when wet, rich in calcium and magnesium, ideal for cotton, pulses, and oilseeds."
    },
    "Red & Yellow Soil": {
        "N": 45, "P": 35, "K": 30, "ph": 6.1,
        "desc": "Found in Tamil Nadu, Odisha, Karnataka. Porous, crumbly, rich in iron and potash, low in nitrogen and phosphorus."
    },
    "Laterite Soil": {
        "N": 35, "P": 25, "K": 35, "ph": 5.2,
        "desc": "Found in Kerala, Western Ghats. Acidic, leached by heavy rainfall, rich in iron/aluminum, suitable for tea, coffee, rubber, and cashew."
    },
    "Sandy Loam / Coastal Soil": {
        "N": 40, "P": 28, "K": 22, "ph": 6.6,
        "desc": "Free-draining, easy to till, requires frequent irrigation and organic matter replenishment. Great for vegetables, groundnut, and melons."
    },
    "Clay Loam / Heavy Soil": {
        "N": 85, "P": 55, "K": 45, "ph": 6.9,
        "desc": "Balanced nutrient holding capacity and water retention. Highly productive for rice, sugarcane, and vegetables."
    }
}

SEASON_WEATHER_DATA = {
    "Kharif (Monsoon / Summer Sowing: June - Oct)": {"temperature": 28.0, "humidity": 80.0, "rainfall": 160.0},
    "Rabi (Winter Sowing: Oct - March)": {"temperature": 19.5, "humidity": 55.0, "rainfall": 60.0},
    "Zaid (Summer Short Season: March - June)": {"temperature": 32.0, "humidity": 45.0, "rainfall": 35.0}
}

# --- 3. PLANT DISEASES DATABASE ---
DISEASES_DB = [
    {
        "id": "rice_blast",
        "crop": "Rice",
        "name": "Rice Blast (Pyricularia oryzae)",
        "symptoms": "Spindle/diamond-shaped lesions with grey/ash center and brown margins on leaves; rotting of neck and panicle.",
        "pathogen": "Fungus (Ascomycete)",
        "severity": "High",
        "organic": "Foliar spray of Pseudomonas fluorescens @ 5g/L or 5% Neem Seed Kernel Extract (NSKE).",
        "chemical": "Tricyclazole 75 WP @ 0.6g/L of water or Isoprothiolane 40 EC @ 1.5ml/L.",
        "prevention": "Avoid excess nitrogen fertilizer application; treat seeds with Carbendazim (2g/kg); maintain clean field borders."
    },
    {
        "id": "wheat_yellow_rust",
        "crop": "Wheat",
        "name": "Yellow / Stripe Rust (Puccinia striiformis)",
        "symptoms": "Bright yellow pustules arranged in parallel linear stripes on leaf blades; yellow dust powders fingers when touched.",
        "pathogen": "Fungus (Basidiomycete)",
        "severity": "Severe",
        "organic": "Foliar spray of fermented sour buttermilk (10%) or wettable sulfur @ 2.5g/L.",
        "chemical": "Tebuconazole 25.9 EC @ 1.25ml/L or Propiconazole 25 EC @ 1ml/L immediately at first sign.",
        "prevention": "Grow rust-resistant cultivars (HD-2967, DBW-187); avoid delayed sowing beyond November."
    },
    {
        "id": "cotton_bollworm",
        "crop": "Cotton",
        "name": "Pink Bollworm (Pectinophora gossypiella)",
        "symptoms": "Rosetted flowers that fail to bloom properly; internal larvae feeding inside bolls with stained damaged lint.",
        "pathogen": "Lepidopteran Insect Pest",
        "severity": "Severe",
        "organic": "Install pheromone traps @ 5-8 traps/acre; release Trichogramma egg parasitoids @ 50,000/acre weekly.",
        "chemical": "Chlorantraniliprole 18.5 SC @ 0.3ml/L or Emamectin Benzoate 5 SG @ 0.4g/L.",
        "prevention": "Strictly follow termination of cotton ratoon crop; destroy ginning trash."
    },
    {
        "id": "tomato_early_blight",
        "crop": "Tomato",
        "name": "Tomato Early Blight (Alternaria solani)",
        "symptoms": "Circular brown to black spots with characteristic concentric target-board rings on older lower leaves.",
        "pathogen": "Fungus (Alternaria)",
        "severity": "Moderate",
        "organic": "Spray Trichoderma viride @ 5g/L or copper soap fungicide; mulch heavily with straw.",
        "chemical": "Mancozeb 75 WP @ 2.5g/L or Chlorothalonil 75 WP @ 2g/L.",
        "prevention": "Stake plants upright; water at root level using drip; prune lower leaves touching soil."
    },
    {
        "id": "potato_late_blight",
        "crop": "Potato",
        "name": "Late Blight (Phytophthora infestans)",
        "symptoms": "Water-soaked dark lesions spreading rapidly under cool moist fog; white fuzzy growth underneath leaves.",
        "pathogen": "Oomycete Fungus",
        "severity": "Critical",
        "organic": "Bordeaux Mixture (1%) spray; immediate rogueing and burning of diseased plants.",
        "chemical": "Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L or Cymoxanil + Mancozeb @ 2g/L.",
        "prevention": "Plant certified blight-free tubers; avoid overhead irrigation during humid weather."
    },
    {
        "id": "banana_sigatoka",
        "crop": "Banana",
        "name": "Sigatoka Leaf Spot (Pseudocercospora fijiensis)",
        "symptoms": "Tiny chlorotic yellowish streaks on leaves that enlarge into dark brown spindle spots with dried sunken centers.",
        "pathogen": "Fungus",
        "severity": "High",
        "organic": "Deleafing of heavily spotted leaves; spray agricultural mineral oil (1%) + Trichoderma.",
        "chemical": "Propiconazole 25 EC @ 1ml/L or Carbendazim 50 WP @ 1g/L combined with mineral oil.",
        "prevention": "Ensure deep drainage ditches to avoid stagnant root water; maintain 2m x 2m spacing."
    },
    {
        "id": "sugarcane_red_rot",
        "crop": "Sugarcane",
        "name": "Sugarcane Red Rot (Colletotrichum falcatum)",
        "symptoms": "Discoloration and yellowing of top leaves; internal stem tissues turn blood red with white transverse patches.",
        "pathogen": "Fungus",
        "severity": "Severe",
        "organic": "Sett treatment with Trichoderma viride suspension; intercrop with onion/garlic.",
        "chemical": "Sett treatment with Carbendazim (1g/L) for 20 minutes before planting.",
        "prevention": "Plant disease-resistant varieties (Co-0238, Co-86032); avoid ratoon crop in infected fields."
    },
    {
        "id": "maize_fall_armyworm",
        "crop": "Maize",
        "name": "Fall Armyworm (Spodoptera frugiperda)",
        "symptoms": "Pin-holes and windowpane feeding on young leaves; heavy frass resembling sawdust inside the central whorl.",
        "pathogen": "Invasive Pest Larvae",
        "severity": "Severe",
        "organic": "Whorl application of dry sand + wood ash (9:1); spray Bacillus thuringiensis (Bt) @ 2g/L.",
        "chemical": "Spinetoram 11.7 SC @ 0.5ml/L or Flubendiamide 39.35 SC @ 0.3ml/L.",
        "prevention": "Intercrop with desmodium or cowpea (push-pull strategy); early synchronized planting."
    },
    {
        "id": "general_aphid_infestation",
        "crop": "All Crops",
        "name": "Aphids & Whitefly Sucking Complex",
        "symptoms": "Curling and puckering of tender shoots; sticky honeydew secretion with black sooty mold fungus coating leaves.",
        "pathogen": "Sucking Insect Pest",
        "severity": "Moderate",
        "organic": "Yellow sticky traps (10/acre); spray Neem Oil (10,000 ppm) @ 3ml/L + liquid soap.",
        "chemical": "Imidacloprid 17.8 SL @ 0.3ml/L or Acetamiprid 20 SP @ 0.3g/L.",
        "prevention": "Preserve beneficial predators like Ladybird beetles and Hoverflies; avoid over-fertilizing with nitrogen."
    }
]

# --- 4. 120-DAY CROP ROADMAP & CALENDAR ---
CROP_ROADMAPS = {
    "Wheat": [
        {"phase": "Phase 1 (Days 1-15)", "stage": "Land Prep & Sowing", "tasks": "Plough field 2-3 times, apply basal dose (all DAP + 50% MOP + 30% Urea), treat seed with Carbendazim, sow at 5cm depth with 20cm row spacing."},
        {"phase": "Phase 2 (Days 16-30)", "stage": "Crown Root Initiation (CRI)", "tasks": "Most critical irrigation stage at Day 21; apply first top-dressing of Urea (35%); manual or chemical weeding (Clodinafop-propargyl for grassy weeds)."},
        {"phase": "Phase 3 (Days 31-60)", "stage": "Tillering & Jointing", "tasks": "Second irrigation at Day 45; apply final split dose of Urea; scout leaves for yellow rust stripes."},
        {"phase": "Phase 4 (Days 61-90)", "stage": "Flowering & Grain Filling", "tasks": "Third critical irrigation at boot/flowering stage; prevent water stress during grain milking; spray 13-0-45 (Potassium Nitrate) for plump grains."},
        {"phase": "Phase 5 (Days 91-125)", "stage": "Dough & Maturity", "tasks": "Cease irrigation 10 days prior to harvest; harvest when grain moisture drops below 14% and straw turns golden dry."}
    ],
    "Rice": [
        {"phase": "Phase 1 (Days 1-25)", "stage": "Nursery & Puddling", "tasks": "Raise nursery bed, treat seeds with Trichoderma; puddle main field with 5cm standing water; incorporate basal fertilizers (DAP + Zinc sulfate + Potash)."},
        {"phase": "Phase 2 (Days 26-45)", "stage": "Transplanting & Active Tillering", "tasks": "Transplant 2-3 seedlings/hill at 20x15cm; maintain 2-3cm water layer; apply 1st top dressing of Urea at Day 35; install yellow stem borer pheromone traps."},
        {"phase": "Phase 3 (Days 46-75)", "stage": "Panicle Initiation & Stem Elongation", "tasks": "Apply 2nd top dressing of Urea; maintain intermittent wetting and drying to strengthen roots; inspect for brown planthopper (BPH) at stem bases."},
        {"phase": "Phase 4 (Days 76-105)", "stage": "Heading, Flowering & Milking", "tasks": "Ensure continuous water supply during heading; spray Tricyclazole if blast lesions appear; foliar spray of 19-19-19 for grain weight."},
        {"phase": "Phase 5 (Days 106-135)", "stage": "Grain Ripening & Harvesting", "tasks": "Drain water 10-14 days before harvest; harvest when 85% of panicles turn golden brown; sun-dry paddy to 12% moisture."}
    ],
    "Cotton": [
        {"phase": "Phase 1 (Days 1-20)", "stage": "Sowing & Germination", "tasks": "Deep summer ploughing; form ridges and furrows (90x60cm spacing); sow acid-delinted seeds; apply basal dose of FYM, DAP, and Potash."},
        {"phase": "Phase 2 (Days 21-50)", "stage": "Square Formation & Vegetative", "tasks": "Thinning to single healthy seedling per hill; 1st split Urea at Day 30; install yellow sticky traps for whiteflies; intercultivation for weed suppression."},
        {"phase": "Phase 3 (Days 51-85)", "stage": "Peak Flowering & Early Boll", "tasks": "2nd split Urea + MOP; spray Planofix (NAA) @ 4.5ml/15L water to prevent flower drop; install pink bollworm pheromone traps."},
        {"phase": "Phase 4 (Days 86-120)", "stage": "Boll Development & Maturation", "tasks": "Protect bolls against bollworms; spray 1% Magnesium Sulfate + 1% Urea to prevent leaf reddening (neeradi); drip irrigate at 4-5 day intervals."},
        {"phase": "Phase 5 (Days 121-160)", "stage": "Boll Bursting & Picking", "tasks": "Pick clean open bolls in dry sunny morning hours; avoid picking trash or dry leaves; separate stained cotton from Grade A produce."}
    ],
    "Default": [
        {"phase": "Phase 1 (Weeks 1-2)", "stage": "Land Preparation", "tasks": "Soil testing, deep tilling, basal organic manure (FYM) application, seed bed layout and furrow shaping."},
        {"phase": "Phase 2 (Weeks 3-4)", "stage": "Sowing & Establishment", "tasks": "Certified seed inoculation, recommended row spacing, first light irrigation, germination audit."},
        {"phase": "Phase 3 (Weeks 5-8)", "stage": "Vegetative Growth & Nutrition", "tasks": "First top-dressing of nitrogen, hand/mechanical weeding, moisture maintenance, pest scouting."},
        {"phase": "Phase 4 (Weeks 9-12)", "stage": "Flowering & Fruit/Grain Setting", "tasks": "Critical irrigation window, micronutrient foliar spray, protective bio-fungicide application."},
        {"phase": "Phase 5 (Weeks 13-16)", "stage": "Ripening & Harvesting", "tasks": "Moisture restriction, check maturity indices, harvest during dry weather, grade and pack produce."}
    ]
}

# --- 5. MANDI RATES & MSP BENCHMARKS ---
MANDI_DATA = [
    {"crop": "Wheat", "msp": "₹2,275 / Qtl", "modal": "₹2,450 / Qtl", "trend": "Bullish 📈", "advice": "Strong procurement demand. Store 2-3 months for peak offseason prices."},
    {"crop": "Rice (Paddy)", "msp": "₹2,300 / Qtl", "modal": "₹2,380 / Qtl", "trend": "Steady ➡️", "advice": "Sell directly at government MSP procurement centres for assured payout."},
    {"crop": "Cotton", "msp": "₹7,121 / Qtl", "modal": "₹7,650 / Qtl", "trend": "Bullish 📈", "advice": "Textile mill demand is solid; ensure moisture is below 8% to get top grade rate."},
    {"crop": "Maize", "msp": "₹2,090 / Qtl", "modal": "₹2,220 / Qtl", "trend": "Bullish 📈", "advice": "High poultry and starch industry demand; favorable selling window."},
    {"crop": "Chickpea (Gram)", "msp": "₹5,440 / Qtl", "modal": "₹5,800 / Qtl", "trend": "Bullish 📈", "advice": "Pulse prices holding premium above MSP. Hold if storage available."},
    {"crop": "Groundnut", "msp": "₹6,783 / Qtl", "modal": "₹7,100 / Qtl", "trend": "Steady ➡️", "advice": "Export quality pods fetching good premiums in Gujarat/AP mandis."},
    {"crop": "Soybean", "msp": "₹4,892 / Qtl", "modal": "₹4,950 / Qtl", "trend": "Steady ➡️", "advice": "Track international edible oil futures for optimal dispatch timing."},
    {"crop": "Mustard", "msp": "₹5,650 / Qtl", "modal": "₹5,900 / Qtl", "trend": "Bullish 📈", "advice": "Oil extraction plants actively buying; sell in tranches."},
    {"crop": "Banana", "msp": "Market Driven", "modal": "₹1,800 / Qtl", "trend": "Steady ➡️", "advice": "Coordinate with wholesale distributors or regional fruit traders before harvest."},
    {"crop": "Tomato", "msp": "Market Driven", "modal": "₹2,100 / Qtl", "trend": "Volatile ⚡", "advice": "Highly perishable; harvest at breaker/pink stage for distant markets."}
]

# --- 6. GOVT SCHEMES & SUBSIDIES ---
GOVT_SCHEMES = [
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "benefit": "₹6,000 per year in 3 equal installments of ₹2,000 directly to farmer bank accounts.",
        "eligibility": "All landholding farmer families across India (small, marginal, and large).",
        "portal": "https://pmkisan.gov.in",
        "docs": "Aadhaar Card, Land ownership papers (Khatauni/7/12 extract), Bank Account."
    },
    {
        "name": "PM Fasal Bima Yojana (PMFBY - Crop Insurance)",
        "benefit": "Comprehensive financial cover against drought, flood, pests, and post-harvest losses. Premium is just 1.5% for Rabi, 2% for Kharif.",
        "eligibility": "All farmers growing notified crops in notified areas (both loanee and non-loanee).",
        "portal": "https://pmfby.gov.in",
        "docs": "Land sowing certificate, Bank passbook, Aadhaar, Crop insurance proposal."
    },
    {
        "name": "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
        "benefit": "55% subsidy for small and marginal farmers, 45% for others to install Drip & Sprinkler irrigation.",
        "eligibility": "Farmers with assured water source and land title.",
        "portal": "https://pmksy.gov.in",
        "docs": "Water source proof, Land record, Soil test card, Quotation from empaneled micro-irrigation vendor."
    },
    {
        "name": "Kisan Credit Card (KCC Scheme)",
        "benefit": "Subsidized institutional credit up to ₹3,00,000 at 4% effective interest rate (with timely repayment). Collateral-free up to ₹1.6 Lakh.",
        "eligibility": "Individual farmers, joint borrowers, tenant farmers, self-help groups.",
        "portal": "https://agricoop.nic.in",
        "docs": "Land possession certificate, identity proof, residence proof, passport photo."
    },
    {
        "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "benefit": "40% to 50% capital subsidy on purchasing tractors, rotavators, power weeders, harvesters, and solar dryers.",
        "eligibility": "Individual farmers, farmer producer organizations (FPOs), custom hiring centres.",
        "portal": "https://agrimachinery.nic.in",
        "docs": "Aadhaar, Land record, Caste certificate (if applicable), Bank passbook, Dealer quotation."
    },
    {
        "name": "Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)",
        "benefit": "₹50,000 per hectare financial assistance over 3 years for organic inputs, PGS organic certification, and eco-packaging.",
        "eligibility": "Farmers forming clusters of 50 or more acres committed to chemical-free agriculture.",
        "portal": "https://pgsindia-ncof.gov.in",
        "docs": "Cluster member list, Aadhaar, Land documents, Organic farm commitment affidavit."
    }
]

# --- 7. AI AGRONOMIST CHATBOT ENGINE ---
CHAT_KNOWLEDGE = {
    "yellow_leaves": "Yellowing leaves (chlorosis) usually indicates either Nitrogen deficiency (older leaves yellowing from tip downwards) or Iron/Zinc deficiency (interveinal yellowing on new tender shoots). If soil is waterlogged, it suffocates roots and causes generalized yellowing. Test: add 20g Urea per plant or spray 0.5% Zinc sulfate.",
    "organic_pest": "For effective organic pest control: 1) Spray Neem Oil (10,000 ppm) @ 3ml per litre of water mixed with 1ml mild liquid soap. 2) Install 5 yellow and 5 blue sticky traps per acre. 3) For caterpillars, use Bacillus thuringiensis (Bt) @ 2g/L. 4) Use sour buttermilk fermented with garlic for fungal leaf spots.",
    "drip_irrigation": "Drip irrigation saves 40% to 60% of water and increases crop yields by 20% to 35%. It delivers water and soluble liquid fertilizers (fertigation) directly to the root zone. You can also avail a 55% government subsidy under the PMKSY 'Per Drop More Crop' scheme.",
    "ph_fix": "If your soil pH is acidic (below 6.0), apply Agricultural Lime (Calcium Carbonate) at 250-400 kg/acre. If your soil pH is alkaline (above 7.8), apply Agricultural Gypsum (Calcium Sulfate) at 200-350 kg/acre and plow in green manure crops like Dhaincha.",
    "urea_burn": "Excess chemical nitrogen (Urea) leads to leaf scorch, weakens stem fiber causing crop lodging during high winds, and severely attracts sucking pests like aphids, whiteflies, and planthoppers. Always split Urea into 2-3 installments rather than a single heavy dose.",
    "general": "I am Kisan Mitra, your AI Agronomist! I can help you choose the best crops for your soil, calculate exact fertilizer bag requirements, diagnose crop diseases and pests, guide you through a 120-day farming roadmap, and assist you in applying for government subsidies. What crop or field issue would you like help with today?"
}

def ai_chat(query, lang="en"):
    q = query.lower()
    if "yellow" in q or "pila" in q or "chlorosis" in q:
        resp = CHAT_KNOWLEDGE["yellow_leaves"]
    elif "pest" in q or "insect" in q or "kida" in q or "spray" in q or "organic" in q:
        resp = CHAT_KNOWLEDGE["organic_pest"]
    elif "water" in q or "irrigation" in q or "drip" in q or "sinchai" in q:
        resp = CHAT_KNOWLEDGE["drip_irrigation"]
    elif "ph" in q or "acid" in q or "alkali" in q or "gypsum" in q or "lime" in q:
        resp = CHAT_KNOWLEDGE["ph_fix"]
    elif "urea" in q or "fertilizer" in q or "khad" in q:
        resp = CHAT_KNOWLEDGE["urea_burn"]
    else:
        resp = CHAT_KNOWLEDGE["general"]

    # Multilingual greeting prepend if requested
    if lang == "hi":
        resp = f"नमस्ते किसान मित्र! {resp}"
    elif lang == "pa":
        resp = f"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! {resp}"
    elif lang == "te":
        resp = f"నమస్కారం రైతు మిత్రమా! {resp}"
    elif lang == "mr":
        resp = f"नमस्कार शेतकरी मित्र! {resp}"
    elif lang == "ta":
        resp = f"வணக்கம் விவசாய தோழரே! {resp}"

    return {"response": resp, "lang": lang}

# --- 8. PRECISION ROI CALCULATOR ---
def calculate_roi(crop_name, acres=1.0, seed_cost=2500, fert_cost=4000, labor_cost=5000,
                  irrigation_cost=2000, pest_cost=2500, other_cost=1500,
                  expected_yield_qtl=20.0, price_per_qtl=2400.0):
    acres = max(0.1, float(acres))
    cost_per_acre = float(seed_cost + fert_cost + labor_cost + irrigation_cost + pest_cost + other_cost)
    total_cost = cost_per_acre * acres

    total_production_qtl = float(expected_yield_qtl) * acres
    gross_revenue = total_production_qtl * float(price_per_qtl)
    net_profit = gross_revenue - total_cost
    roi_percent = (net_profit / total_cost * 100.0) if total_cost > 0 else 0.0
    breakeven_price = total_cost / total_production_qtl if total_production_qtl > 0 else 0.0

    return {
        "crop": crop_name,
        "acres": acres,
        "cost_breakdown": {
            "seed": seed_cost * acres,
            "fertilizers": fert_cost * acres,
            "labor": labor_cost * acres,
            "irrigation": irrigation_cost * acres,
            "pesticides": pest_cost * acres,
            "machinery_misc": other_cost * acres
        },
        "total_investment": round(total_cost, 2),
        "total_yield_quintals": round(total_production_qtl, 1),
        "gross_revenue": round(gross_revenue, 2),
        "net_profit": round(net_profit, 2),
        "roi_percent": round(roi_percent, 1),
        "breakeven_price_per_qtl": round(breakeven_price, 1)
    }