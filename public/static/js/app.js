/**
 * AgriSmart AI - Universal Dual-Mode Controller & Client-Side Agronomic AI Engine
 * Operates seamlessly on both Static Hosting (Netlify, Vercel, GitHub Pages)
 * and Full-Stack Python Server environments (Render, Railway, Docker, Local).
 */

const CROP_CENTROIDS = {
  "Rice": [80, 48, 40, 24.5, 82.0, 6.4, 236.0],
  "Wheat": [75, 45, 35, 18.5, 55.0, 6.8, 75.0],
  "Maize": [78, 48, 20, 22.5, 65.0, 6.2, 85.0],
  "Barley": [60, 35, 30, 17.0, 50.0, 7.0, 60.0],
  "Millets (Bajra)": [45, 25, 20, 30.0, 45.0, 7.2, 45.0],
  "Chickpea": [40, 68, 80, 19.0, 17.0, 7.3, 80.0],
  "Kidney Beans": [20, 67, 20, 20.0, 21.0, 5.7, 106.0],
  "Pigeon Peas": [21, 68, 20, 28.0, 48.0, 5.7, 150.0],
  "Moth Beans": [21, 48, 20, 28.0, 53.0, 6.8, 51.0],
  "Mung Bean": [21, 47, 20, 28.0, 86.0, 6.7, 48.0],
  "Black Gram": [40, 67, 19, 30.0, 65.0, 7.1, 68.0],
  "Lentil": [19, 68, 19, 25.0, 65.0, 6.9, 46.0],
  "Cotton": [120, 46, 20, 24.0, 80.0, 6.9, 80.0],
  "Sugarcane": [105, 42, 70, 27.5, 75.0, 6.7, 155.0],
  "Jute": [78, 46, 40, 25.0, 80.0, 6.7, 175.0],
  "Coffee": [100, 28, 30, 25.0, 58.0, 6.8, 158.0],
  "Tea": [90, 35, 45, 21.0, 85.0, 5.2, 220.0],
  "Groundnut": [20, 60, 20, 28.0, 65.0, 6.5, 100.0],
  "Mustard": [65, 35, 30, 18.0, 58.0, 6.6, 50.0],
  "Soybean": [30, 65, 35, 26.0, 70.0, 6.4, 90.0],
  "Banana": [100, 80, 50, 27.0, 80.0, 6.0, 105.0],
  "Mango": [20, 27, 30, 31.0, 50.0, 5.7, 95.0],
  "Grapes": [23, 132, 200, 24.0, 82.0, 6.0, 69.0],
  "Apple": [21, 134, 200, 23.0, 92.0, 5.9, 113.0],
  "Orange": [20, 16, 10, 23.0, 92.0, 7.0, 110.0],
  "Papaya": [50, 59, 50, 34.0, 92.0, 6.7, 143.0],
  "Pomegranate": [19, 19, 40, 22.0, 90.0, 6.4, 108.0],
  "Watermelon": [99, 17, 50, 26.0, 85.0, 6.5, 51.0],
  "Coconut": [22, 17, 31, 27.0, 95.0, 5.9, 176.0],
  "Tomato": [85, 60, 60, 23.0, 70.0, 6.5, 80.0],
  "Potato": [90, 50, 70, 19.0, 60.0, 5.8, 65.0],
  "Onion": [70, 45, 45, 22.0, 65.0, 6.5, 60.0]
};

const FEATURE_SCALES = [25.0, 20.0, 25.0, 3.5, 12.0, 0.6, 35.0];

const STATIC_PRESETS = [
  {
    id: "punjab_wheat",
    name: "🌾 Punjab Indo-Gangetic Plain",
    desc: "Rich alluvial soil, optimal for winter wheat, mustard, or potato",
    data: { N: 76, P: 44, K: 36, temperature: 18.5, humidity: 55.0, ph: 6.8, rainfall: 72.0 }
  },
  {
    id: "maharashtra_cotton",
    name: "🌱 Maharashtra Deccan Black Soil",
    desc: "Heavy clayey black soil high in moisture retention, ideal for cotton or soybean",
    data: { N: 118, P: 46, K: 22, temperature: 25.5, humidity: 78.0, ph: 7.1, rainfall: 82.0 }
  },
  {
    id: "bengal_paddy",
    name: "🌾 Bengal & Assam Delta Paddy",
    desc: "High rainfall, tropical humidity, ideal for rice paddy or jute",
    data: { N: 82, P: 48, K: 40, temperature: 26.0, humidity: 84.0, ph: 6.3, rainfall: 230.0 }
  },
  {
    id: "karnataka_horticulture",
    name: "🍌 Karnataka South Horticultural Belt",
    desc: "Warm humid conditions, excellent for banana, papaya, or maize",
    data: { N: 98, P: 78, K: 48, temperature: 27.0, humidity: 80.0, ph: 6.1, rainfall: 105.0 }
  },
  {
    id: "rajasthan_arid",
    name: "🏜️ Western Arid Sandy Loam",
    desc: "Low rainfall, high temperature, suited for drought-resistant Millets (Bajra) or Moth Beans",
    data: { N: 42, P: 24, K: 20, temperature: 30.0, humidity: 44.0, ph: 7.3, rainfall: 45.0 }
  },
  {
    id: "himachal_apple",
    name: "🍎 Sub-Himalayan Hill Orchard",
    desc: "Cool mountain climate with high potassium and phosphorus, ideal for apple or temperate fruits",
    data: { N: 22, P: 132, K: 195, temperature: 21.0, humidity: 90.0, ph: 5.9, rainfall: 115.0 }
  }
];

const STATIC_DISEASES = [
  {
    id: "rice_blast",
    crop: "Rice",
    name: "Rice Blast (Pyricularia oryzae)",
    symptoms: "Spindle/diamond-shaped lesions with grey/ash center and brown margins on leaves; rotting of neck and panicle.",
    pathogen: "Fungus (Ascomycete)",
    severity: "High",
    organic: "Foliar spray of Pseudomonas fluorescens @ 5g/L or 5% Neem Seed Kernel Extract (NSKE).",
    chemical: "Tricyclazole 75 WP @ 0.6g/L of water or Isoprothiolane 40 EC @ 1.5ml/L.",
    prevention: "Avoid excess nitrogen fertilizer application; treat seeds with Carbendazim (2g/kg); maintain clean field borders."
  },
  {
    id: "wheat_yellow_rust",
    crop: "Wheat",
    name: "Yellow / Stripe Rust (Puccinia striiformis)",
    symptoms: "Bright yellow pustules arranged in parallel linear stripes on leaf blades; yellow dust powders fingers when touched.",
    pathogen: "Fungus (Basidiomycete)",
    severity: "Severe",
    organic: "Foliar spray of fermented sour buttermilk (10%) or wettable sulfur @ 2.5g/L.",
    chemical: "Tebuconazole 25.9 EC @ 1.25ml/L or Propiconazole 25 EC @ 1ml/L immediately at first sign.",
    prevention: "Grow rust-resistant cultivars (HD-2967, DBW-187); avoid delayed sowing beyond November."
  },
  {
    id: "cotton_bollworm",
    crop: "Cotton",
    name: "Pink Bollworm (Pectinophora gossypiella)",
    symptoms: "Rosetted flowers that fail to bloom properly; internal larvae feeding inside bolls with stained damaged lint.",
    pathogen: "Lepidopteran Insect Pest",
    severity: "Severe",
    organic: "Install pheromone traps @ 5-8 traps/acre; release Trichogramma egg parasitoids @ 50,000/acre weekly.",
    chemical: "Chlorantraniliprole 18.5 SC @ 0.3ml/L or Emamectin Benzoate 5 SG @ 0.4g/L.",
    prevention: "Strictly follow termination of cotton ratoon crop; destroy ginning trash."
  },
  {
    id: "tomato_early_blight",
    crop: "Tomato",
    name: "Tomato Early Blight (Alternaria solani)",
    symptoms: "Circular brown to black spots with characteristic concentric target-board rings on older lower leaves.",
    pathogen: "Fungus (Alternaria)",
    severity: "Moderate",
    organic: "Spray Trichoderma viride @ 5g/L or copper soap fungicide; mulch heavily with straw.",
    chemical: "Mancozeb 75 WP @ 2.5g/L or Chlorothalonil 75 WP @ 2g/L.",
    prevention: "Stake plants upright; water at root level using drip; prune lower leaves touching soil."
  },
  {
    id: "potato_late_blight",
    crop: "Potato",
    name: "Late Blight (Phytophthora infestans)",
    symptoms: "Water-soaked dark lesions spreading rapidly under cool moist fog; white fuzzy growth underneath leaves.",
    pathogen: "Oomycete Fungus",
    severity: "Critical",
    organic: "Bordeaux Mixture (1%) spray; immediate rogueing and burning of diseased plants.",
    chemical: "Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L or Cymoxanil + Mancozeb @ 2g/L.",
    prevention: "Plant certified blight-free tubers; avoid overhead irrigation during humid weather."
  },
  {
    id: "banana_sigatoka",
    crop: "Banana",
    name: "Sigatoka Leaf Spot (Pseudocercospora fijiensis)",
    symptoms: "Tiny chlorotic yellowish streaks on leaves that enlarge into dark brown spindle spots with dried sunken centers.",
    pathogen: "Fungus",
    severity: "High",
    organic: "Deleafing of heavily spotted leaves; spray agricultural mineral oil (1%) + Trichoderma.",
    chemical: "Propiconazole 25 EC @ 1ml/L or Carbendazim 50 WP @ 1g/L combined with mineral oil.",
    prevention: "Ensure deep drainage ditches to avoid stagnant root water; maintain 2m x 2m spacing."
  },
  {
    id: "sugarcane_red_rot",
    crop: "Sugarcane",
    name: "Sugarcane Red Rot (Colletotrichum falcatum)",
    symptoms: "Discoloration and yellowing of top leaves; internal stem tissues turn blood red with white transverse patches.",
    pathogen: "Fungus",
    severity: "Severe",
    organic: "Sett treatment with Trichoderma viride suspension; intercrop with onion/garlic.",
    chemical: "Sett treatment with Carbendazim (1g/L) for 20 minutes before planting.",
    prevention: "Plant disease-resistant varieties (Co-0238, Co-86032); avoid ratoon crop in infected fields."
  },
  {
    id: "maize_fall_armyworm",
    crop: "Maize",
    name: "Fall Armyworm (Spodoptera frugiperda)",
    symptoms: "Pin-holes and windowpane feeding on young leaves; heavy frass resembling sawdust inside the central whorl.",
    pathogen: "Invasive Pest Larvae",
    severity: "Severe",
    organic: "Whorl application of dry sand + wood ash (9:1); spray Bacillus thuringiensis (Bt) @ 2g/L.",
    chemical: "Spinetoram 11.7 SC @ 0.5ml/L or Flubendiamide 39.35 SC @ 0.3ml/L.",
    prevention: "Intercrop with desmodium or cowpea (push-pull strategy); early synchronized planting."
  },
  {
    id: "general_aphid_infestation",
    crop: "All Crops",
    name: "Aphids & Whitefly Sucking Complex",
    symptoms: "Curling and puckering of tender shoots; sticky honeydew secretion with black sooty mold fungus coating leaves.",
    pathogen: "Sucking Insect Pest",
    severity: "Moderate",
    organic: "Yellow sticky traps (10/acre); spray Neem Oil (10,000 ppm) @ 3ml/L + liquid soap.",
    chemical: "Imidacloprid 17.8 SL @ 0.3ml/L or Acetamiprid 20 SP @ 0.3g/L.",
    prevention: "Preserve beneficial predators like Ladybird beetles and Hoverflies; avoid over-fertilizing with nitrogen."
  }
];

const STATIC_MANDI = [
  { crop: "Wheat", msp: "₹2,275 / Qtl", modal: "₹2,450 / Qtl", trend: "Bullish 📈", advice: "Strong procurement demand. Store 2-3 months for peak offseason prices." },
  { crop: "Rice (Paddy)", msp: "₹2,300 / Qtl", modal: "₹2,380 / Qtl", trend: "Steady ➡️", advice: "Sell directly at government MSP procurement centres for assured payout." },
  { crop: "Cotton", msp: "₹7,121 / Qtl", modal: "₹7,650 / Qtl", trend: "Bullish 📈", advice: "Textile mill demand is solid; ensure moisture is below 8% to get top grade rate." },
  { crop: "Maize", msp: "₹2,090 / Qtl", modal: "₹2,220 / Qtl", trend: "Bullish 📈", advice: "High poultry and starch industry demand; favorable selling window." },
  { crop: "Chickpea (Gram)", msp: "₹5,440 / Qtl", modal: "₹5,800 / Qtl", trend: "Bullish 📈", advice: "Pulse prices holding premium above MSP. Hold if storage available." },
  { crop: "Groundnut", msp: "₹6,783 / Qtl", modal: "₹7,100 / Qtl", trend: "Steady ➡️", advice: "Export quality pods fetching good premiums in Gujarat/AP mandis." },
  { crop: "Soybean", msp: "₹4,892 / Qtl", modal: "₹4,950 / Qtl", trend: "Steady ➡️", advice: "Track international edible oil futures for optimal dispatch timing." },
  { crop: "Mustard", msp: "₹5,650 / Qtl", modal: "₹5,900 / Qtl", trend: "Bullish 📈", advice: "Oil extraction plants actively buying; sell in tranches." },
  { crop: "Banana", msp: "Market Driven", modal: "₹1,800 / Qtl", trend: "Steady ➡️", advice: "Coordinate with wholesale distributors or regional fruit traders before harvest." },
  { crop: "Tomato", msp: "Market Driven", modal: "₹2,100 / Qtl", trend: "Volatile ⚡", advice: "Highly perishable; harvest at breaker/pink stage for distant markets." }
];

const STATIC_SCHEMES = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    benefit: "₹6,000 per year in 3 equal installments of ₹2,000 directly to farmer bank accounts.",
    eligibility: "All landholding farmer families across India (small, marginal, and large).",
    portal: "https://pmkisan.gov.in",
    docs: "Aadhaar Card, Land ownership papers (Khatauni/7/12 extract), Bank Account."
  },
  {
    name: "PM Fasal Bima Yojana (PMFBY - Crop Insurance)",
    benefit: "Comprehensive financial cover against drought, flood, pests, and post-harvest losses. Premium is just 1.5% for Rabi, 2% for Kharif.",
    eligibility: "All farmers growing notified crops in notified areas (both loanee and non-loanee).",
    portal: "https://pmfby.gov.in",
    docs: "Land sowing certificate, Bank passbook, Aadhaar, Crop insurance proposal."
  },
  {
    name: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
    benefit: "55% subsidy for small and marginal farmers, 45% for others to install Drip & Sprinkler irrigation.",
    eligibility: "Farmers with assured water source and land title.",
    portal: "https://pmksy.gov.in",
    docs: "Water source proof, Land record, Soil test card, Quotation from empaneled micro-irrigation vendor."
  },
  {
    name: "Kisan Credit Card (KCC Scheme)",
    benefit: "Subsidized institutional credit up to ₹3,00,000 at 4% effective interest rate (with timely repayment). Collateral-free up to ₹1.6 Lakh.",
    eligibility: "Individual farmers, joint borrowers, tenant farmers, self-help groups.",
    portal: "https://agricoop.nic.in",
    docs: "Land possession certificate, identity proof, residence proof, passport photo."
  },
  {
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    benefit: "40% to 50% capital subsidy on purchasing tractors, rotavators, power weeders, harvesters, and solar dryers.",
    eligibility: "Individual farmers, farmer producer organizations (FPOs), custom hiring centres.",
    portal: "https://agrimachinery.nic.in",
    docs: "Aadhaar, Land record, Caste certificate (if applicable), Bank passbook, Dealer quotation."
  },
  {
    name: "Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)",
    benefit: "₹50,000 per hectare financial assistance over 3 years for organic inputs, PGS organic certification, and eco-packaging.",
    eligibility: "Farmers forming clusters of 50 or more acres committed to chemical-free agriculture.",
    portal: "https://pgsindia-ncof.gov.in",
    docs: "Cluster member list, Aadhaar, Land documents, Organic farm commitment affidavit."
  }
];

const STATIC_ROADMAPS = {
  Wheat: [
    { phase: "Phase 1 (Days 1-15)", stage: "Land Prep & Sowing", tasks: "Plough field 2-3 times, apply basal dose (all DAP + 50% MOP + 30% Urea), treat seed with Carbendazim, sow at 5cm depth with 20cm row spacing." },
    { phase: "Phase 2 (Days 16-30)", stage: "Crown Root Initiation (CRI)", tasks: "Most critical irrigation stage at Day 21; apply first top-dressing of Urea (35%); manual or chemical weeding (Clodinafop-propargyl for grassy weeds)." },
    { phase: "Phase 3 (Days 31-60)", stage: "Tillering & Jointing", tasks: "Second irrigation at Day 45; apply final split dose of Urea; scout leaves for yellow rust stripes." },
    { phase: "Phase 4 (Days 61-90)", stage: "Flowering & Grain Filling", tasks: "Third critical irrigation at boot/flowering stage; prevent water stress during grain milking; spray 13-0-45 (Potassium Nitrate) for plump grains." },
    { phase: "Phase 5 (Days 91-125)", stage: "Dough & Maturity", tasks: "Cease irrigation 10 days prior to harvest; harvest when grain moisture drops below 14% and straw turns golden dry." }
  ],
  Rice: [
    { phase: "Phase 1 (Days 1-25)", stage: "Nursery & Puddling", tasks: "Raise nursery bed, treat seeds with Trichoderma; puddle main field with 5cm standing water; incorporate basal fertilizers (DAP + Zinc sulfate + Potash)." },
    { phase: "Phase 2 (Days 26-45)", stage: "Transplanting & Active Tillering", tasks: "Transplant 2-3 seedlings/hill at 20x15cm; maintain 2-3cm water layer; apply 1st top dressing of Urea at Day 35; install yellow stem borer pheromone traps." },
    { phase: "Phase 3 (Days 46-75)", stage: "Panicle Initiation & Stem Elongation", tasks: "Apply 2nd top dressing of Urea; maintain intermittent wetting and drying to strengthen roots; inspect for brown planthopper (BPH) at stem bases." },
    { phase: "Phase 4 (Days 76-105)", stage: "Heading, Flowering & Milking", tasks: "Ensure continuous water supply during heading; spray Tricyclazole if blast lesions appear; foliar spray of 19-19-19 for grain weight." },
    { phase: "Phase 5 (Days 106-135)", stage: "Grain Ripening & Harvesting", tasks: "Drain water 10-14 days before harvest; harvest when 85% of panicles turn golden brown; sun-dry paddy to 12% moisture." }
  ],
  Cotton: [
    { phase: "Phase 1 (Days 1-20)", stage: "Sowing & Germination", tasks: "Deep summer ploughing; form ridges and furrows (90x60cm spacing); sow acid-delinted seeds; apply basal dose of FYM, DAP, and Potash." },
    { phase: "Phase 2 (Days 21-50)", stage: "Square Formation & Vegetative", tasks: "Thinning to single healthy seedling per hill; 1st split Urea at Day 30; install yellow sticky traps for whiteflies; intercultivation for weed suppression." },
    { phase: "Phase 3 (Days 51-85)", stage: "Peak Flowering & Early Boll", tasks: "2nd split Urea + MOP; spray Planofix (NAA) @ 4.5ml/15L water to prevent flower drop; install pink bollworm pheromone traps." },
    { phase: "Phase 4 (Days 86-120)", stage: "Boll Development & Maturation", tasks: "Protect bolls against bollworms; spray 1% Magnesium Sulfate + 1% Urea to prevent leaf reddening (neeradi); drip irrigate at 4-5 day intervals." },
    { phase: "Phase 5 (Days 121-160)", stage: "Boll Bursting & Picking", tasks: "Pick clean open bolls in dry sunny morning hours; avoid picking trash or dry leaves; separate stained cotton from Grade A produce." }
  ],
  Default: [
    { phase: "Phase 1 (Weeks 1-2)", stage: "Land Preparation", tasks: "Soil testing, deep tilling, basal organic manure (FYM) application, seed bed layout and furrow shaping." },
    { phase: "Phase 2 (Weeks 3-4)", stage: "Sowing & Establishment", tasks: "Certified seed inoculation, recommended row spacing, first light irrigation, germination audit." },
    { phase: "Phase 3 (Weeks 5-8)", stage: "Vegetative Growth & Nutrition", tasks: "First top-dressing of nitrogen, hand/mechanical weeding, moisture maintenance, pest scouting." },
    { phase: "Phase 4 (Weeks 9-12)", stage: "Flowering & Fruit/Grain Setting", tasks: "Critical irrigation window, micronutrient foliar spray, protective bio-fungicide application." },
    { phase: "Phase 5 (Weeks 13-16)", stage: "Ripening & Harvesting", tasks: "Moisture restriction, check maturity indices, harvest during dry weather, grade and pack produce." }
  ]
};

// --- CLIENT-SIDE ML INFERENCE ---
function clientPredictCrops(field) {
  const x = [
    field.N || 70,
    field.P || 45,
    field.K || 35,
    field.temperature || 24,
    field.humidity || 65,
    field.ph || 6.5,
    field.rainfall || 90
  ];

  const scores = [];
  for (const [crop, mu] of Object.entries(CROP_CENTROIDS)) {
    let distSq = 0;
    for (let i = 0; i < 7; i++) {
      const diff = (x[i] - mu[i]) / FEATURE_SCALES[i];
      distSq += diff * diff;
    }
    scores.push({ crop, logLikelihood: -0.5 * distSq, centroid: mu });
  }

  const maxLog = Math.max(...scores.map(s => s.logLikelihood));
  const expScores = scores.map(s => ({
    crop: s.crop,
    exp: Math.exp(s.logLikelihood - maxLog),
    centroid: s.centroid
  }));
  const sumExp = expScores.reduce((acc, curr) => acc + curr.exp, 0);

  const ranked = expScores
    .map(s => {
      const conf = Math.round((s.exp / sumExp) * 1000) / 10;
      const reasons = [];
      const mu = s.centroid;
      if (Math.abs(x[6] - mu[6]) < 40) reasons.push("Rainfall matches crop requirement");
      if (Math.abs(x[3] - mu[3]) < 4) reasons.push("Temperature profile is favorable");
      if (Math.abs(x[5] - mu[5]) < 0.6) reasons.push("Soil pH aligns with root physiology");
      const matchReason = reasons.length ? reasons.join(", ") : "Good overall environmental compatibility";
      return {
        crop: s.crop,
        confidence: Math.max(0.1, conf),
        suitability: conf >= 50 ? "High" : conf >= 20 ? "Moderate" : "Fair",
        reason: matchReason
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  const top1 = ranked[0];
  const fertPlan = clientFertilizerAdvice(top1.crop, field);

  return {
    status: "success",
    field,
    ranked: ranked.slice(0, 5),
    best_crop: top1.crop,
    best_confidence: top1.confidence,
    fertilizer_plan: fertPlan,
    advice: fertPlan.summary
  };
}

function clientFertilizerAdvice(crop, field) {
  const profile = CROP_CENTROIDS[crop] || [80, 45, 40, 24, 70, 6.5, 100];
  const [optN, optP, optK, , , optPh] = profile;

  const curN = parseFloat(field.N || optN);
  const curP = parseFloat(field.P || optP);
  const curK = parseFloat(field.K || optK);
  const curPh = parseFloat(field.ph || 6.5);

  const diffN = optN - curN;
  const diffP = optP - curP;
  const diffK = optK - curK;

  const actions = [];
  const commercial = [];

  if (diffN > 5) {
    const ureaKg = diffN / 0.46;
    const bags = (ureaKg / 2.47) / 50.0;
    actions.push(`Nitrogen Deficit: Soil has ${curN.toFixed(0)} kg/ha (ideal ~${optN.toFixed(0)}). Add Urea.`);
    commercial.push({
      fertilizer: "Urea (46% N)",
      dosage_per_acre: `${(ureaKg / 2.47).toFixed(1)} kg/acre (${Math.max(0.2, bags).toFixed(1)} bags)`,
      split_timing: "Apply in 2 to 3 split doses (basal + vegetative tillering)"
    });
  }

  if (diffP > 4) {
    const dapKg = diffP / 0.46;
    const bags = (dapKg / 2.47) / 50.0;
    actions.push(`Phosphorus Deficit: Soil has ${curP.toFixed(0)} kg/ha (ideal ~${optP.toFixed(0)}). Add DAP/SSP.`);
    commercial.push({
      fertilizer: "DAP (Di-Ammonium Phosphate) or SSP",
      dosage_per_acre: `${(dapKg / 2.47).toFixed(1)} kg/acre (${Math.max(0.2, bags).toFixed(1)} bags DAP)`,
      split_timing: "Apply 100% as basal dose during final land preparation before sowing"
    });
  }

  if (diffK > 5) {
    const mopKg = diffK / 0.60;
    const bags = (mopKg / 2.47) / 50.0;
    actions.push(`Potassium Deficit: Soil has ${curK.toFixed(0)} kg/ha (ideal ~${optK.toFixed(0)}). Add MOP.`);
    commercial.push({
      fertilizer: "MOP (Muriate of Potash - 60% K2O)",
      dosage_per_acre: `${(mopKg / 2.47).toFixed(1)} kg/acre (${Math.max(0.2, bags).toFixed(1)} bags)`,
      split_timing: "Apply 50% basal and 50% at flowering / fruit setting stage"
    });
  }

  let phStatus = "Optimal / Neutral";
  let phAdvice = "Soil pH is in the optimal range (6.2 - 7.5). Excellent nutrient assimilation capacity.";

  if (curPh < 5.6) {
    phStatus = "Strongly Acidic";
    phAdvice = "Soil pH is acidic. Apply Agricultural Lime (CaCO3) @ 250-350 kg/acre during ploughing to neutralise soil.";
  } else if (curPh < 6.2) {
    phStatus = "Moderately Acidic";
    phAdvice = "Soil is mildly acidic. Suitable for most crops; add 2 tonnes of farmyard manure (FYM) or compost.";
  } else if (curPh > 8.3) {
    phStatus = "Strongly Alkaline / Saline";
    phAdvice = "Soil is strongly alkaline (pH > 8.3). Use elemental sulfur (50-80 kg/acre), ensure drainage, and add humic acids.";
  } else if (curPh > 7.5) {
    phStatus = "Moderately Alkaline";
    phAdvice = "Soil is moderately alkaline. Apply Gypsum (CaSO4) @ 200 kg/acre and green manuring (Dhaincha).";
  }

  const organic = [
    "Well-decomposed Farm Yard Manure (FYM): 4-5 tonnes/acre",
    "Vermicompost: 1.5-2 tonnes/acre enriched with Trichoderma viride",
    "Biofertilizers: Azotobacter / Rhizobium + PSB @ 2 kg/acre seed or soil treatment",
    "Neem Cake: 150 kg/acre (acts as organic N and suppresses soil nematodes)"
  ];

  return {
    summary: actions.length ? actions.join("; ") : `Soil N-P-K nutrient status is in near-optimal balance for ${crop}.`,
    actions,
    commercial,
    ph_status: phStatus,
    ph_advice: phAdvice,
    organic
  };
}

// --- STATE & CONTROLLER ---
const state = {
  activeTab: "crop-recommender",
  presets: STATIC_PRESETS,
  diseases: STATIC_DISEASES,
  schemes: STATIC_SCHEMES,
  mandi: STATIC_MANDI,
  currentField: {
    N: 76,
    P: 44,
    K: 36,
    temperature: 19.0,
    humidity: 55.0,
    ph: 6.8,
    rainfall: 75.0
  },
  lastRecommendation: null
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRangeInputs();
  populatePresets();
  renderDiseaseCards(state.diseases);
  initDiseaseSearch();
  renderMandiTable(state.mandi);
  renderSchemes(state.schemes);
  loadLiveWeather();
  initChat();
  initVoiceAssistant();
  initSoilWizard();
  initRoadmap();
  initRoiCalculator();

  predictCrops();
});

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === tabId);
  });
}

function initRangeInputs() {
  const fields = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
  fields.forEach(f => {
    const range = document.getElementById(`range_${f}`);
    const badge = document.getElementById(`val_${f}`);
    if (range && badge) {
      range.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        state.currentField[f] = val;
        badge.textContent = f === "temperature" ? `${val}°C` :
                            f === "humidity" ? `${val}%` :
                            f === "rainfall" ? `${val} mm` :
                            f === "ph" ? val.toFixed(1) : `${val} kg/ha`;
        if (f === "ph") updatePhBadge(val);
      });
    }
  });

  const predictBtn = document.getElementById("btnPredict");
  if (predictBtn) {
    predictBtn.addEventListener("click", predictCrops);
  }
}

function updatePhBadge(ph) {
  const phZone = document.getElementById("phZone");
  if (!phZone) return;
  if (ph < 5.8) {
    phZone.textContent = "Acidic Soil (Requires Lime)";
    phZone.style.color = "#dc2626";
  } else if (ph <= 7.5) {
    phZone.textContent = "Optimal Neutral Range (Ideal)";
    phZone.style.color = "#059669";
  } else {
    phZone.textContent = "Alkaline Soil (Requires Gypsum)";
    phZone.style.color = "#d97706";
  }
}

function updateSlidersFromState() {
  const fields = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
  fields.forEach(f => {
    const range = document.getElementById(`range_${f}`);
    const badge = document.getElementById(`val_${f}`);
    const val = state.currentField[f];
    if (range && badge && val !== undefined) {
      range.value = val;
      badge.textContent = f === "temperature" ? `${val}°C` :
                          f === "humidity" ? `${val}%` :
                          f === "rainfall" ? `${val} mm` :
                          f === "ph" ? parseFloat(val).toFixed(1) : `${val} kg/ha`;
      if (f === "ph") updatePhBadge(val);
    }
  });
}

function populatePresets() {
  const select = document.getElementById("presetSelect");
  if (!select) return;
  select.innerHTML = '<option value="">-- Choose Field Preset --</option>';
  state.presets.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  select.addEventListener("change", (e) => {
    const pid = e.target.value;
    const found = state.presets.find(x => x.id === pid);
    if (found) {
      state.currentField = { ...found.data };
      updateSlidersFromState();
      predictCrops();
    }
  });
}

async function predictCrops() {
  const predictBtn = document.getElementById("btnPredict");
  if (predictBtn) {
    predictBtn.disabled = true;
    predictBtn.textContent = "Analyzing Soil & Climate...";
  }

  let data = null;
  try {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.currentField)
    });
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {}

  if (!data || data.status !== "success") {
    data = clientPredictCrops(state.currentField);
  }

  state.lastRecommendation = data;
  renderRecommendationResults(data);
  renderFertilizerDoctor(data.best_crop, data.fertilizer_plan);
  renderReportPreview(data);

  if (predictBtn) {
    predictBtn.disabled = false;
    predictBtn.textContent = "🌾 Predict Optimal Crops & Nutrients";
  }
}

function renderRecommendationResults(data) {
  const top1 = data.ranked[0];
  const runner1 = data.ranked[1];
  const runner2 = data.ranked[2];

  document.getElementById("topCropName").textContent = top1.crop;
  document.getElementById("topConfidence").textContent = `${top1.confidence}% Match`;
  document.getElementById("topProgressBar").style.width = `${top1.confidence}%`;
  document.getElementById("topReason").textContent = top1.reason;

  const runnersContainer = document.getElementById("runnerList");
  runnersContainer.innerHTML = "";

  [runner1, runner2].forEach((r, idx) => {
    if (!r) return;
    const row = document.createElement("div");
    row.className = "runner-row";
    row.innerHTML = `
      <div class="runner-name">#${idx + 2} ${r.crop}</div>
      <div class="runner-score">${r.confidence}% Match <span style="font-size:11px;color:#64748b;font-weight:normal">(${r.suitability})</span></div>
    `;
    runnersContainer.appendChild(row);
  });

  document.getElementById("quickFertAdvice").textContent = data.advice;
}

function renderFertilizerDoctor(crop, fertPlan) {
  const container = document.getElementById("fertPlanContainer");
  if (!container) return;

  const targetCropSelect = document.getElementById("fertTargetCrop");
  if (targetCropSelect && targetCropSelect.children.length <= 1) {
    const crops = Object.keys(CROP_CENTROIDS);
    crops.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      if (c === crop) opt.selected = true;
      targetCropSelect.appendChild(opt);
    });
    targetCropSelect.addEventListener("change", () => {
      predictCrops();
    });
  }

  let html = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-title">
        <span>Soil Health & pH Status: <strong>${fertPlan.ph_status}</strong></span>
      </div>
      <p style="font-size:13.5px;color:var(--text-muted);">${fertPlan.ph_advice}</p>
    </div>
  `;

  html += `<h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">Commercial Mineral Fertilizers Required (per acre):</h3>`;
  html += `<div class="fert-pill-grid">`;

  if (fertPlan.commercial && fertPlan.commercial.length > 0) {
    fertPlan.commercial.forEach(item => {
      html += `
        <div class="fert-pill">
          <h4>${item.fertilizer}</h4>
          <p><strong>Dosage:</strong> ${item.dosage_per_acre}</p>
          <p style="margin-top:6px;font-size:11.5px;color:#059669;"><strong>Application:</strong> ${item.split_timing}</p>
        </div>
      `;
    });
  } else {
    html += `
      <div class="fert-pill" style="border-left-color:#10b981;">
        <h4>Nutrient Balance Optimal</h4>
        <p>No acute chemical nitrogen, phosphorus, or potash deficit detected for ${crop}.</p>
      </div>
    `;
  }
  html += `</div>`;

  html += `<h3 style="font-size:15px;font-weight:700;margin:20px 0 12px;">Organic Soil Enriched Alternatives:</h3>`;
  html += `<div class="card" style="background:var(--bg-card-subtle);">`;
  html += `<ul style="padding-left:20px;font-size:13px;color:var(--text-muted);display:flex;flex-direction:column;gap:8px;">`;
  fertPlan.organic.forEach(org => {
    html += `<li>${org}</li>`;
  });
  html += `</ul></div>`;

  container.innerHTML = html;
}

function initSoilWizard() {
  const applyBtn = document.getElementById("btnApplyWizard");
  if (!applyBtn) return;

  const soilBaselines = {
    "Alluvial Soil": { N: 72, P: 46, K: 38, ph: 6.8 },
    "Black Cotton Soil (Regur)": { N: 110, P: 45, K: 24, ph: 7.4 },
    "Red & Yellow Soil": { N: 45, P: 35, K: 30, ph: 6.1 },
    "Laterite Soil": { N: 35, P: 25, K: 35, ph: 5.2 },
    "Sandy Loam / Coastal Soil": { N: 40, P: 28, K: 22, ph: 6.6 },
    "Clay Loam / Heavy Soil": { N: 85, P: 55, K: 45, ph: 6.9 }
  };

  const seasonBaselines = {
    "Kharif (Monsoon / Summer Sowing: June - Oct)": { temperature: 28.0, humidity: 80.0, rainfall: 160.0 },
    "Rabi (Winter Sowing: Oct - March)": { temperature: 19.5, humidity: 55.0, rainfall: 60.0 },
    "Zaid (Summer Short Season: March - June)": { temperature: 32.0, humidity: 45.0, rainfall: 35.0 }
  };

  applyBtn.addEventListener("click", () => {
    const soilType = document.getElementById("wizardSoilType").value;
    const season = document.getElementById("wizardSeason").value;

    const s = soilBaselines[soilType] || soilBaselines["Alluvial Soil"];
    const w = seasonBaselines[season] || seasonBaselines["Kharif (Monsoon / Summer Sowing: June - Oct)"];

    state.currentField = { ...s, ...w };
    updateSlidersFromState();
    switchTab("crop-recommender");
    predictCrops();
  });
}

function renderDiseaseCards(diseases) {
  const grid = document.getElementById("diseaseGrid");
  if (!grid) return;
  grid.innerHTML = "";

  diseases.forEach(d => {
    const card = document.createElement("div");
    card.className = "disease-card";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;">${d.crop}</span>
        <span class="severity-pill severity-${d.severity}">${d.severity}</span>
      </div>
      <h4 style="font-size:14.5px;font-weight:700;color:var(--text-main);">${d.name}</h4>
      <p style="font-size:12.5px;color:var(--text-muted);">${d.symptoms.substring(0, 85)}...</p>
      <div style="font-size:11.5px;color:var(--primary);font-weight:600;margin-top:auto;">Inspect Diagnosis & Remedy →</div>
    `;
    card.addEventListener("click", () => showDiseaseDetails(d));
    grid.appendChild(card);
  });
}

function showDiseaseDetails(d) {
  const modal = document.getElementById("diseaseDetailModal");
  if (!modal) return;
  modal.innerHTML = `
    <div class="card" style="border:1.5px solid var(--primary);animation:fadeIn 0.25s ease;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="severity-pill severity-${d.severity}">${d.severity} Severity</span>
        <span style="font-size:12px;color:var(--text-muted);">Crop: <strong>${d.crop}</strong> | Pathogen: <strong>${d.pathogen}</strong></span>
      </div>
      <h3 style="font-size:18px;font-weight:800;color:var(--text-main);margin-bottom:10px;">${d.name}</h3>
      <div style="margin-bottom:14px;">
        <strong style="font-size:13px;">Observed Symptoms:</strong>
        <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">${d.symptoms}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="fert-pill" style="border-left-color:#10b981;">
          <h4>🌿 Organic & Bio-Control:</h4>
          <p>${d.organic}</p>
        </div>
        <div class="fert-pill" style="border-left-color:#0284c7;">
          <h4>🧪 Chemical Prescription:</h4>
          <p>${d.chemical}</p>
        </div>
      </div>
      <div style="font-size:12.5px;color:var(--text-muted);background:var(--bg-card-subtle);padding:10px 14px;border-radius:var(--radius-md);">
        <strong>Cultural Prevention:</strong> ${d.prevention}
      </div>
    </div>
  `;
  modal.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function initDiseaseSearch() {
  const searchInput = document.getElementById("diseaseSearch");
  const cropFilter = document.getElementById("diseaseCropFilter");

  const filterAction = () => {
    const q = (searchInput ? searchInput.value : "").toLowerCase();
    const c = (cropFilter ? cropFilter.value : "");

    const filtered = state.diseases.filter(d => {
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.symptoms.toLowerCase().includes(q);
      const matchC = !c || d.crop === c || d.crop === "All Crops";
      return matchQ && matchC;
    });
    renderDiseaseCards(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", filterAction);
  if (cropFilter) cropFilter.addEventListener("change", filterAction);
}

function initRoadmap() {
  const cropSelect = document.getElementById("roadmapCropSelect");
  if (!cropSelect) return;

  const loadRoadmap = (crop) => {
    const roadmap = STATIC_ROADMAPS[crop] || STATIC_ROADMAPS["Default"];
    renderRoadmap(roadmap);
  };

  cropSelect.addEventListener("change", (e) => loadRoadmap(e.target.value));
  loadRoadmap(cropSelect.value || "Wheat");
}

function renderRoadmap(roadmap) {
  const container = document.getElementById("roadmapTimeline");
  if (!container) return;
  container.innerHTML = "";

  roadmap.forEach(step => {
    const el = document.createElement("div");
    el.className = "timeline-step";
    el.innerHTML = `
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-phase">${step.phase}</span>
          <span class="timeline-stage">${step.stage}</span>
        </div>
        <p class="timeline-tasks">${step.tasks}</p>
      </div>
    `;
    container.appendChild(el);
  });
}

function initRoiCalculator() {
  const roiInputs = ["roiAcres", "roiSeed", "roiFert", "roiLabor", "roiIrrig", "roiPest", "roiMisc", "roiYield", "roiPrice"];
  const calc = () => {
    const acres = Math.max(0.1, parseFloat(document.getElementById("roiAcres").value) || 1.0);
    const seed = parseFloat(document.getElementById("roiSeed").value) || 2500;
    const fert = parseFloat(document.getElementById("roiFert").value) || 4000;
    const labor = parseFloat(document.getElementById("roiLabor").value) || 5000;
    const irrig = parseFloat(document.getElementById("roiIrrig").value) || 2000;
    const pest = parseFloat(document.getElementById("roiPest").value) || 2500;
    const misc = parseFloat(document.getElementById("roiMisc").value) || 1500;
    const yieldQtl = parseFloat(document.getElementById("roiYield").value) || 20;
    const priceQtl = parseFloat(document.getElementById("roiPrice").value) || 2400;

    const costPerAcre = seed + fert + labor + irrig + pest + misc;
    const totalCost = costPerAcre * acres;
    const totalYield = yieldQtl * acres;
    const grossRev = totalYield * priceQtl;
    const netProfit = grossRev - totalCost;
    const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100.0 : 0.0;
    const breakeven = totalYield > 0 ? totalCost / totalYield : 0.0;

    document.getElementById("roiTotalCost").textContent = `₹${Math.round(totalCost).toLocaleString()}`;
    document.getElementById("roiGrossRev").textContent = `₹${Math.round(grossRev).toLocaleString()}`;
    document.getElementById("roiNetProfit").textContent = `₹${Math.round(netProfit).toLocaleString()}`;
    document.getElementById("roiPercentage").textContent = `${roiPercent.toFixed(1)}% ROI`;
    document.getElementById("roiBreakeven").textContent = `₹${breakeven.toFixed(1)} / Qtl`;
  };

  roiInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  const cropSelect = document.getElementById("roiCrop");
  if (cropSelect) cropSelect.addEventListener("change", calc);

  calc();
}

async function loadLiveWeather() {
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto");
    const data = await res.json();
    const curr = data.current || {};
    const temp = curr.temperature_2m !== undefined ? curr.temperature_2m : 24.5;
    const hum = curr.relative_humidity_2m !== undefined ? curr.relative_humidity_2m : 60;
    const wind = curr.wind_speed_10m !== undefined ? curr.wind_speed_10m : 7.2;
    const rain = curr.precipitation !== undefined ? curr.precipitation : 0.0;

    document.getElementById("weatherTemp").textContent = `${temp}°C`;
    document.getElementById("weatherHum").textContent = `${hum}%`;
    document.getElementById("weatherWind").textContent = `${wind} km/h`;
    document.getElementById("weatherRain").textContent = `${rain} mm`;

    const spraySafe = wind < 15.0 && rain < 1.0;
    const badge = document.getElementById("sprayBadge");
    if (badge) {
      if (spraySafe) {
        badge.className = "status-pill";
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
        badge.textContent = "✅ Optimal Spraying Conditions";
      } else {
        badge.className = "status-pill";
        badge.style.background = "#fee2e2";
        badge.style.color = "#b91c1c";
        badge.textContent = "⚠️ Delay Spraying (High Wind/Precipitation)";
      }
    }
    const adv = document.getElementById("sprayAdvisoryText");
    if (adv) {
      adv.textContent = spraySafe ? "Low wind and zero precipitation detected. Suitable for foliar fertilizers and bio-pesticides." : "Adverse wind velocity or rain detected. Chemical spray drift warning.";
    }
  } catch (err) {
    document.getElementById("weatherTemp").textContent = "24.5°C";
    document.getElementById("weatherHum").textContent = "60%";
    document.getElementById("weatherWind").textContent = "7.2 km/h";
    document.getElementById("weatherRain").textContent = "0.0 mm";
  }
}

function renderMandiTable(mandi) {
  const tbody = document.getElementById("mandiTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  mandi.forEach(m => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-light)";
    tr.innerHTML = `
      <td style="padding:12px;font-weight:700;">${m.crop}</td>
      <td style="padding:12px;color:#0284c7;font-weight:600;">${m.msp}</td>
      <td style="padding:12px;font-weight:700;color:#059669;">${m.modal}</td>
      <td style="padding:12px;">${m.trend}</td>
      <td style="padding:12px;font-size:12.5px;color:var(--text-muted);">${m.advice}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSchemes(schemes) {
  const container = document.getElementById("schemesGrid");
  if (!container) return;
  container.innerHTML = "";
  schemes.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">
        <span style="font-size:15px;color:var(--primary);">${s.name}</span>
      </div>
      <p style="font-size:13px;color:var(--text-main);margin-bottom:8px;"><strong>Benefits:</strong> ${s.benefit}</p>
      <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;"><strong>Eligibility:</strong> ${s.eligibility}</p>
      <p style="font-size:12px;color:#64748b;margin-bottom:14px;"><strong>Required Documents:</strong> ${s.docs}</p>
      <a href="${s.portal}" target="_blank" class="btn btn-secondary" style="font-size:12px;padding:6px 12px;display:inline-block;text-decoration:none;">Visit Official Portal ↗</a>
    `;
    container.appendChild(card);
  });
}

const CHAT_ANSWERS = {
  yellow: "Yellowing leaves (chlorosis) usually indicates either Nitrogen deficiency (older leaves yellowing from tip downwards) or Iron/Zinc deficiency (interveinal yellowing on new shoots). If soil is waterlogged, it suffocates roots and causes yellowing. Quick test: apply 20g Urea or spray 0.5% Zinc sulfate.",
  pest: "For effective organic pest control: 1) Spray Neem Oil (10,000 ppm) @ 3ml per litre of water mixed with 1ml mild liquid soap. 2) Install 5 yellow and 5 blue sticky traps per acre. 3) For caterpillars, use Bacillus thuringiensis (Bt) @ 2g/L.",
  water: "Drip irrigation saves 40% to 60% of water and increases crop yields by 20% to 35%. You can avail a 55% government subsidy under the PMKSY 'Per Drop More Crop' scheme.",
  ph: "If your soil pH is acidic (below 6.0), apply Agricultural Lime (Calcium Carbonate) at 250-400 kg/acre. If your soil pH is alkaline (above 7.8), apply Agricultural Gypsum (Calcium Sulfate) at 200-350 kg/acre and plow in green manure crops like Dhaincha.",
  urea: "Excess chemical nitrogen (Urea) leads to leaf scorch, weakens stem fiber causing lodging during high winds, and severely attracts sucking pests like aphids, whiteflies, and planthoppers. Always split Urea into 2-3 installments rather than a single heavy dose.",
  default: "I am Kisan Mitra, your AI Agronomist! I can help you choose the best crops for your soil, calculate exact fertilizer bag requirements, diagnose crop diseases, guide you through a 120-day farming roadmap, and assist you in applying for government subsidies. What crop or field issue would you like help with today?"
};

function initChat() {
  const sendBtn = document.getElementById("btnSendChat");
  const chatInput = document.getElementById("chatInput");
  const langSelect = document.getElementById("chatLang");

  const sendMsg = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    chatInput.value = "";

    const q = text.toLowerCase();
    let reply = CHAT_ANSWERS.default;
    if (q.includes("yellow") || q.includes("pila")) reply = CHAT_ANSWERS.yellow;
    else if (q.includes("pest") || q.includes("insect") || q.includes("spray") || q.includes("organic")) reply = CHAT_ANSWERS.pest;
    else if (q.includes("water") || q.includes("drip") || q.includes("irrigation")) reply = CHAT_ANSWERS.water;
    else if (q.includes("ph") || q.includes("acid") || q.includes("lime") || q.includes("gypsum")) reply = CHAT_ANSWERS.ph;
    else if (q.includes("urea") || q.includes("fertilizer") || q.includes("khad")) reply = CHAT_ANSWERS.urea;

    const lang = langSelect ? langSelect.value : "en";
    if (lang === "hi") reply = `नमस्ते किसान मित्र! ${reply}`;
    else if (lang === "pa") reply = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ${reply}`;
    else if (lang === "te") reply = `నమస్కారం రైతు మిత్రమా! ${reply}`;
    else if (lang === "mr") reply = `नमस्कार शेतकरी मित्र! ${reply}`;
    else if (lang === "ta") reply = `வணக்கம் விவசாய தோழரே! ${reply}`;

    setTimeout(() => appendMessage(reply, "bot"), 300);
  };

  if (sendBtn) sendBtn.addEventListener("click", sendMsg);
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMsg();
    });
  }

  document.querySelectorAll(".prompt-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      if (chatInput) {
        chatInput.value = pill.textContent;
        sendMsg();
      }
    });
  });
}

function appendMessage(text, sender) {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  if (sender === "bot" && window.speechSynthesis) {
    const speakBtn = document.getElementById("btnToggleTTS");
    if (speakBtn && speakBtn.classList.contains("speaking")) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }
}

function initVoiceAssistant() {
  const micBtn = document.getElementById("btnVoiceInput");
  const chatInput = document.getElementById("chatInput");

  if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {
      micBtn.style.background = "#fee2e2";
      micBtn.textContent = "🎙️ Listening...";
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (chatInput) chatInput.value = transcript;
      micBtn.style.background = "";
      micBtn.textContent = "🎙️ Speak";
      const sendBtn = document.getElementById("btnSendChat");
      if (sendBtn) sendBtn.click();
    };

    recognition.onerror = () => {
      micBtn.style.background = "";
      micBtn.textContent = "🎙️ Speak";
    };

    recognition.onend = () => {
      micBtn.style.background = "";
      micBtn.textContent = "🎙️ Speak";
    };
  }

  const speakBtn = document.getElementById("btnToggleTTS");
  if (speakBtn) {
    speakBtn.addEventListener("click", () => {
      speakBtn.classList.toggle("speaking");
      if (speakBtn.classList.contains("speaking")) {
        speakBtn.style.background = "#dcfce7";
        speakBtn.textContent = "🔊 Voice Reading ON";
      } else {
        speakBtn.style.background = "";
        speakBtn.textContent = "🔈 Voice Reading OFF";
        window.speechSynthesis.cancel();
      }
    });
  }
}

function renderReportPreview(data) {
  const container = document.getElementById("printableReportView");
  if (!container) return;

  const f = state.currentField;
  container.innerHTML = `
    <div style="background:#ffffff;color:#0f172a;border:2px solid #059669;padding:28px;border-radius:12px;max-width:800px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #059669;padding-bottom:12px;margin-bottom:16px;">
        <div>
          <h2 style="font-size:22px;color:#059669;font-weight:800;">AGRISMART AI - SOIL HEALTH & CROP ADVISORY CARD</h2>
          <p style="font-size:12px;color:#64748b;">Ministry of Agriculture & Farmer Welfare Guidelines Aligned</p>
        </div>
        <div style="text-align:right;">
          <span style="background:#ecfdf5;color:#059669;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;">OFFICIAL REPORT</span>
          <p style="font-size:11px;color:#64748b;margin-top:4px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <h4 style="font-size:14px;color:#059669;margin-bottom:8px;">1. FIELD SOIL & ENVIRONMENTAL PROFILE</h4>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12.5px;">
        <tr style="background:#f8fafc;">
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Nitrogen (N):</strong> ${f.N} kg/ha</td>
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Phosphorus (P):</strong> ${f.P} kg/ha</td>
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Potassium (K):</strong> ${f.K} kg/ha</td>
        </tr>
        <tr>
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Soil pH:</strong> ${f.ph}</td>
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Avg Temp:</strong> ${f.temperature}°C</td>
          <td style="padding:6px;border:1px solid #e2e8f0;"><strong>Rainfall:</strong> ${f.rainfall} mm</td>
        </tr>
      </table>

      <h4 style="font-size:14px;color:#059669;margin-bottom:8px;">2. AI CROP SUITABILITY ASSESSMENT</h4>
      <div style="background:#ecfdf5;padding:12px;border-radius:8px;margin-bottom:16px;">
        <p style="font-size:15px;font-weight:800;color:#059669;">Primary Recommended Crop: ${data.best_crop} (${data.best_confidence}% Match)</p>
        <p style="font-size:12.5px;color:#0f172a;margin-top:4px;">Alternate Options: ${data.ranked.slice(1, 3).map(x => `${x.crop} (${x.confidence}%)`).join(", ")}</p>
      </div>

      <h4 style="font-size:14px;color:#059669;margin-bottom:8px;">3. PRECISION FERTILIZER PRESCRIPTION</h4>
      <p style="font-size:12.5px;color:#334155;margin-bottom:8px;">${data.fertilizer_plan.summary}</p>
      <p style="font-size:12.5px;color:#334155;"><strong>pH Neutralization:</strong> ${data.fertilizer_plan.ph_advice}</p>

      <div style="margin-top:24px;border-top:1px dashed #cbd5e1;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#94a3b8;">Generated by AgriSmart AI Machine Learning Engine</span>
        <button onclick="window.print()" class="btn btn-primary" style="font-size:12px;padding:6px 14px;">🖨️ Print / Save PDF</button>
      </div>
    </div>
  `;
}
