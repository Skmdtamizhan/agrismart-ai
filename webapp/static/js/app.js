/**
 * AgriSmart AI - Interactive Frontend Controller
 * Multi-tab router, AI predictions, live weather, voice assistant, and farmer tools.
 */

// State
const state = {
  activeTab: "crop-recommender",
  presets: [],
  diseases: [],
  schemes: [],
  mandi: [],
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

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRangeInputs();
  loadPresets();
  loadDiseases();
  loadMandi();
  loadSchemes();
  loadLiveWeather();
  initChat();
  initVoiceAssistant();

  // Run initial prediction for default field
  predictCrops();
});

// --- NAVIGATION ---
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Dark / Light Theme Toggle
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

// --- RANGE SLIDERS SYNCHRONIZATION ---
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

// --- FIELD PRESETS ---
async function loadPresets() {
  try {
    const res = await fetch("/api/presets");
    const data = await res.json();
    if (data.status === "success") {
      state.presets = data.presets;
      const select = document.getElementById("presetSelect");
      if (!select) return;
      select.innerHTML = '<option value="">-- Choose Field Preset --</option>';
      data.presets.forEach(p => {
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
  } catch (err) {
    console.warn("Failed to load presets:", err);
  }
}

// --- CROP RECOMMENDATION ---
async function predictCrops() {
  const predictBtn = document.getElementById("btnPredict");
  if (predictBtn) {
    predictBtn.disabled = true;
    predictBtn.textContent = "Analyzing Soil & Climate...";
  }

  try {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.currentField)
    });
    const data = await res.json();
    if (data.status === "success") {
      state.lastRecommendation = data;
      renderRecommendationResults(data);
      renderFertilizerDoctor(data.best_crop, data.fertilizer_plan);
      renderReportPreview(data);
    }
  } catch (err) {
    console.error("Prediction error:", err);
  } finally {
    if (predictBtn) {
      predictBtn.disabled = false;
      predictBtn.textContent = "🌾 Predict Optimal Crops & Nutrients";
    }
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

  // Fertilizer summary badge on main tab
  document.getElementById("quickFertAdvice").textContent = data.advice;
}

// --- FERTILIZER & SOIL DOCTOR ---
function renderFertilizerDoctor(crop, fertPlan) {
  const container = document.getElementById("fertPlanContainer");
  if (!container) return;

  const targetCropSelect = document.getElementById("fertTargetCrop");
  if (targetCropSelect && targetCropSelect.children.length <= 1) {
    // Populate crop options
    const crops = ["Wheat", "Rice", "Cotton", "Maize", "Sugarcane", "Groundnut", "Banana", "Tomato", "Potato", "Mustard", "Chickpea"];
    crops.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      if (c === crop) opt.selected = true;
      targetCropSelect.appendChild(opt);
    });
    targetCropSelect.addEventListener("change", (e) => {
      // Re-trigger fertilizer advice
      state.currentField.targetCrop = e.target.value;
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

// --- BEGINNER SOIL WIZARD ---
function initSoilWizard() {
  const applyBtn = document.getElementById("btnApplyWizard");
  if (!applyBtn) return;

  applyBtn.addEventListener("click", async () => {
    const soilType = document.getElementById("wizardSoilType").value;
    const season = document.getElementById("wizardSeason").value;

    try {
      const res = await fetch("/api/soil_wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soil_type: soilType, season: season })
      });
      const data = await res.json();
      if (data.status === "success") {
        state.currentField = { ...data.field };
        updateSlidersFromState();
        switchTab("crop-recommender");
        predictCrops();
      }
    } catch (err) {
      console.error("Wizard error:", err);
    }
  });
}
document.addEventListener("DOMContentLoaded", initSoilWizard);

// --- PLANT DISEASE DOCTOR ---
async function loadDiseases() {
  try {
    const res = await fetch("/api/diseases");
    const data = await res.json();
    if (data.status === "success") {
      state.diseases = data.diseases;
      renderDiseaseCards(data.diseases);
      initDiseaseSearch();
    }
  } catch (err) {
    console.warn("Diseases load failed:", err);
  }
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

// --- 120-DAY CROP ROADMAP ---
function initRoadmap() {
  const cropSelect = document.getElementById("roadmapCropSelect");
  if (!cropSelect) return;

  const loadRoadmap = async (crop) => {
    try {
      const res = await fetch("/api/crop_calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: crop })
      });
      const data = await res.json();
      if (data.status === "success") {
        renderRoadmap(data.roadmap);
      }
    } catch (err) {
      console.warn("Roadmap load error:", err);
    }
  };

  cropSelect.addEventListener("change", (e) => loadRoadmap(e.target.value));
  loadRoadmap(cropSelect.value || "Wheat");
}
document.addEventListener("DOMContentLoaded", initRoadmap);

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

// --- ROI & PROFIT ESTIMATOR ---
function initRoiCalculator() {
  const roiInputs = ["roiAcres", "roiSeed", "roiFert", "roiLabor", "roiIrrig", "roiPest", "roiMisc", "roiYield", "roiPrice"];
  const calc = async () => {
    const payload = {
      crop: document.getElementById("roiCrop") ? document.getElementById("roiCrop").value : "Wheat",
      acres: parseFloat(document.getElementById("roiAcres").value) || 1,
      seed_cost: parseFloat(document.getElementById("roiSeed").value) || 2500,
      fert_cost: parseFloat(document.getElementById("roiFert").value) || 4000,
      labor_cost: parseFloat(document.getElementById("roiLabor").value) || 5000,
      irrigation_cost: parseFloat(document.getElementById("roiIrrig").value) || 2000,
      pest_cost: parseFloat(document.getElementById("roiPest").value) || 2500,
      other_cost: parseFloat(document.getElementById("roiMisc").value) || 1500,
      yield_qtl: parseFloat(document.getElementById("roiYield").value) || 20,
      price_qtl: parseFloat(document.getElementById("roiPrice").value) || 2400
    };

    try {
      const res = await fetch("/api/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        const r = data.roi;
        document.getElementById("roiTotalCost").textContent = `₹${r.total_investment.toLocaleString()}`;
        document.getElementById("roiGrossRev").textContent = `₹${r.gross_revenue.toLocaleString()}`;
        document.getElementById("roiNetProfit").textContent = `₹${r.net_profit.toLocaleString()}`;
        document.getElementById("roiPercentage").textContent = `${r.roi_percent}% ROI`;
        document.getElementById("roiBreakeven").textContent = `₹${r.breakeven_price_per_qtl} / Qtl`;
      }
    } catch (err) {
      console.error("ROI calculation error:", err);
    }
  };

  roiInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  const cropSelect = document.getElementById("roiCrop");
  if (cropSelect) cropSelect.addEventListener("change", calc);

  calc();
}
document.addEventListener("DOMContentLoaded", initRoiCalculator);

// --- LIVE WEATHER & SPRAYING ADVISORY ---
async function loadLiveWeather() {
  try {
    const res = await fetch("/api/weather");
    const data = await res.json();
    if (data.status === "success") {
      document.getElementById("weatherTemp").textContent = `${data.temperature}°C`;
      document.getElementById("weatherHum").textContent = `${data.humidity}%`;
      document.getElementById("weatherWind").textContent = `${data.wind_speed} km/h`;
      document.getElementById("weatherRain").textContent = `${data.rainfall} mm`;

      const badge = document.getElementById("sprayBadge");
      if (badge) {
        if (data.spray_safe) {
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
      if (adv) adv.textContent = data.spray_advisory;
    }
  } catch (err) {
    console.warn("Weather load failed:", err);
  }
}

// --- MANDI PRICES ---
async function loadMandi() {
  try {
    const res = await fetch("/api/mandi");
    const data = await res.json();
    if (data.status === "success") {
      state.mandi = data.mandi;
      const tbody = document.getElementById("mandiTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      data.mandi.forEach(m => {
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
  } catch (err) {
    console.warn("Mandi load failed:", err);
  }
}

// --- GOVT SCHEMES ---
async function loadSchemes() {
  try {
    const res = await fetch("/api/schemes");
    const data = await res.json();
    if (data.status === "success") {
      state.schemes = data.schemes;
      const container = document.getElementById("schemesGrid");
      if (!container) return;
      container.innerHTML = "";
      data.schemes.forEach(s => {
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
  } catch (err) {
    console.warn("Schemes load failed:", err);
  }
}

// --- KISAN MITRA AI CHAT ---
function initChat() {
  const sendBtn = document.getElementById("btnSendChat");
  const chatInput = document.getElementById("chatInput");
  const langSelect = document.getElementById("chatLang");

  const sendMsg = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    chatInput.value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang: langSelect ? langSelect.value : "en" })
      });
      const data = await res.json();
      if (data.status === "success") {
        appendMessage(data.response, "bot");
      }
    } catch (err) {
      appendMessage("Unable to reach Kisan Mitra AI service. Please verify server connection.", "bot");
    }
  };

  if (sendBtn) sendBtn.addEventListener("click", sendMsg);
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMsg();
    });
  }

  // Quick prompt pills
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

  // Speak bot response if voice readout is enabled
  if (sender === "bot" && window.speechSynthesis) {
    const speakBtn = document.getElementById("btnToggleTTS");
    if (speakBtn && speakBtn.classList.contains("speaking")) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }
}

// --- VOICE ASSISTANT (SPEECH TO TEXT & TEXT TO SPEECH) ---
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

// --- PRINTABLE SOIL HEALTH CARD ---
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