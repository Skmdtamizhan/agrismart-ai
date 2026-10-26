"""AgriSmart AI - High Performance Multi-Threaded Web Server & REST API.
Zero external server dependencies required. Runs anywhere.
"""
import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
import os
import json
import urllib.parse
import urllib.request
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

BASE_DIR = Path(__file__).resolve().parent.parent
WEBAPP_DIR = BASE_DIR / "webapp"
TEMPLATES_DIR = WEBAPP_DIR / "templates"
STATIC_DIR = WEBAPP_DIR / "static"
OUTPUTS_DIR = BASE_DIR / "crop_ai" / "outputs"

sys.path.insert(0, str(WEBAPP_DIR))
import api

class AgriSmartHandler(SimpleHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def serve_file(self, filepath, content_type):
        filepath = Path(filepath)
        if not filepath.exists():
            self.send_error(404, f"File {filepath.name} not found")
            return
        data = filepath.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. Root / UI Dashboard
        if path in ("/", "/index.html"):
            index_path = TEMPLATES_DIR / "index.html"
            self.serve_file(index_path, "text/html; charset=utf-8")
            return

        # 2. Static Assets
        if path.startswith("/static/"):
            rel = path[len("/static/"):]
            target = STATIC_DIR / rel
            if path.endswith(".css"):
                self.serve_file(target, "text/css")
            elif path.endswith(".js"):
                self.serve_file(target, "application/javascript")
            elif path.endswith(".png"):
                self.serve_file(target, "image/png")
            elif path.endswith(".svg"):
                self.serve_file(target, "image/svg+xml")
            elif path.endswith(".ico"):
                self.serve_file(target, "image/x-icon")
            else:
                self.serve_file(target, "application/octet-stream")
            return

        # 3. Model Output Visualizations & PDF Report
        if path.startswith("/outputs/"):
            rel = path[len("/outputs/"):]
            target = OUTPUTS_DIR / rel
            if path.endswith(".png"):
                self.serve_file(target, "image/png")
            elif path.endswith(".pdf"):
                self.serve_file(target, "application/pdf")
            elif path.endswith(".json") or path.endswith(".txt"):
                self.serve_file(target, "text/plain; charset=utf-8")
            else:
                self.serve_file(target, "application/octet-stream")
            return

        # 4. REST API GET Endpoints
        if path == "/api/presets":
            self.send_json({"status": "success", "presets": api.FIELD_PRESETS})
            return

        if path == "/api/diseases":
            self.send_json({"status": "success", "diseases": api.DISEASES_DB})
            return

        if path == "/api/mandi":
            self.send_json({"status": "success", "mandi": api.MANDI_DATA})
            return

        if path == "/api/schemes":
            self.send_json({"status": "success", "schemes": api.GOVT_SCHEMES})
            return

        if path == "/api/soil_baselines":
            self.send_json({"status": "success", "soils": api.SOIL_WIZARD_DATA, "seasons": api.SEASON_WEATHER_DATA})
            return

        if path == "/api/model_info":
            summary_path = OUTPUTS_DIR / "summary.json"
            if summary_path.exists():
                with open(summary_path, "r", encoding="utf-8") as f:
                    summary = json.load(f)
                self.send_json({"status": "success", "summary": summary})
            else:
                self.send_json({"status": "warning", "message": "Summary not ready yet."})
            return

        if path == "/api/weather":
            # Real-time weather fetch via Open-Meteo
            lat = query.get("lat", ["28.6139"])[0] # Default New Delhi / Indo-Gangetic
            lon = query.get("lon", ["77.2090"])[0]
            try:
                url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
                req = urllib.request.Request(url, headers={"User-Agent": "AgriSmartAI/1.0"})
                with urllib.request.urlopen(req, timeout=4) as response:
                    wdata = json.loads(response.read().decode())
                
                curr = wdata.get("current", {})
                temp = curr.get("temperature_2m", 24.0)
                hum = curr.get("relative_humidity_2m", 65.0)
                wind = curr.get("wind_speed_10m", 8.0)
                rain = curr.get("precipitation", 0.0)

                # Agronomic advisory
                spray_safe = (wind < 15.0) and (rain < 1.0)
                spray_msg = "Optimal for foliar fertilizer and bio-pesticide spraying." if spray_safe else "Avoid spraying: high winds or precipitation will cause pesticide drift/washoff."
                fungal_risk = (hum > 80.0) and (temp >= 20.0 and temp <= 30.0)

                self.send_json({
                    "status": "success",
                    "live": True,
                    "temperature": temp,
                    "humidity": hum,
                    "wind_speed": wind,
                    "rainfall": rain,
                    "spray_safe": spray_safe,
                    "spray_advisory": spray_msg,
                    "fungal_risk": fungal_risk,
                    "raw": wdata
                })
                return
            except Exception as e:
                # Offline / Fallback Agri Weather
                self.send_json({
                    "status": "success",
                    "live": False,
                    "temperature": 25.0,
                    "humidity": 65.0,
                    "wind_speed": 7.5,
                    "rainfall": 0.0,
                    "spray_safe": True,
                    "spray_advisory": "Weather conditions suitable for field operations and spraying.",
                    "fungal_risk": False,
                    "note": f"Offline mode: {str(e)}"
                })
                return

        # Fallback 404
        self.send_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read JSON body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        payload = {}
        if body:
            try:
                payload = json.loads(body.decode("utf-8"))
            except Exception:
                self.send_json({"status": "error", "message": "Invalid JSON payload"}, 400)
                return

        # 1. Crop Recommendation & Fertilizer Advisory
        if path == "/api/recommend":
            try:
                bundle = api.get_model_bundle()
                model = bundle["model"]
                sc = bundle["scaler"]
                le = bundle["label_encoder"]
                imputer = bundle.get("imputer")

                field = {
                    "N": float(payload.get("N", 70)),
                    "P": float(payload.get("P", 45)),
                    "K": float(payload.get("K", 35)),
                    "temperature": float(payload.get("temperature", 24)),
                    "humidity": float(payload.get("humidity", 65)),
                    "ph": float(payload.get("ph", 6.5)),
                    "rainfall": float(payload.get("rainfall", 90))
                }
                top_k = int(payload.get("top_k", 3))
                result = api.recommend(model, sc, le, field, imputer=imputer, top_k=top_k)
                self.send_json({"status": "success", "field": field, **result})
            except Exception as ex:
                self.send_json({"status": "error", "message": str(ex)}, 500)
            return

        # 2. Beginner Soil Wizard Calculation
        if path == "/api/soil_wizard":
            soil_name = payload.get("soil_type", "Alluvial Soil")
            season_name = payload.get("season", "Kharif (Monsoon / Summer Sowing: June - Oct)")
            soil_info = api.SOIL_WIZARD_DATA.get(soil_name, api.SOIL_WIZARD_DATA["Alluvial Soil"])
            season_info = api.SEASON_WEATHER_DATA.get(season_name, api.SEASON_WEATHER_DATA["Kharif (Monsoon / Summer Sowing: June - Oct)"])

            estimated_field = {
                "N": soil_info["N"],
                "P": soil_info["P"],
                "K": soil_info["K"],
                "ph": soil_info["ph"],
                "temperature": season_info["temperature"],
                "humidity": season_info["humidity"],
                "rainfall": season_info["rainfall"]
            }
            self.send_json({
                "status": "success",
                "soil_type": soil_name,
                "soil_description": soil_info["desc"],
                "season": season_name,
                "field": estimated_field
            })
            return

        # 3. Disease Diagnosis Engine
        if path == "/api/diagnose":
            crop = payload.get("crop", "")
            symptom_query = payload.get("symptoms", "").lower()
            disease_id = payload.get("disease_id", "")

            matched = []
            for d in api.DISEASES_DB:
                if disease_id and d["id"] == disease_id:
                    matched = [d]
                    break
                # Match crop or symptoms
                crop_match = (not crop) or (crop.lower() in d["crop"].lower()) or (d["crop"] == "All Crops")
                symptom_match = any(word in d["symptoms"].lower() or word in d["name"].lower() for word in symptom_query.split()) if symptom_query else True
                if crop_match and symptom_match:
                    matched.append(d)

            if not matched:
                # Fallback to closest or general pest
                matched = [api.DISEASES_DB[-1]]

            self.send_json({"status": "success", "count": len(matched), "results": matched})
            return

        # 4. Crop Calendar & Roadmap
        if path == "/api/crop_calendar":
            crop = payload.get("crop", "Wheat")
            roadmap = api.CROP_ROADMAPS.get(crop, api.CROP_ROADMAPS["Default"])
            self.send_json({"status": "success", "crop": crop, "roadmap": roadmap})
            return

        # 5. ROI & Profit Calculator
        if path == "/api/roi":
            roi_res = api.calculate_roi(
                crop_name=payload.get("crop", "Wheat"),
                acres=payload.get("acres", 1.0),
                seed_cost=payload.get("seed_cost", 2500),
                fert_cost=payload.get("fert_cost", 4000),
                labor_cost=payload.get("labor_cost", 5000),
                irrigation_cost=payload.get("irrigation_cost", 2000),
                pest_cost=payload.get("pest_cost", 2500),
                other_cost=payload.get("other_cost", 1500),
                expected_yield_qtl=payload.get("yield_qtl", 20.0),
                price_per_qtl=payload.get("price_qtl", 2400.0)
            )
            self.send_json({"status": "success", "roi": roi_res})
            return

        # 6. AI Agronomist Chat
        if path == "/api/chat":
            query = payload.get("message", "")
            lang = payload.get("lang", "en")
            chat_res = api.ai_chat(query, lang=lang)
            self.send_json({"status": "success", **chat_res})
            return

        self.send_error(404, "API route not found")

def run_server(port=8501, host="0.0.0.0"):
    # Ensure model is ready before starting
    api.get_model_bundle()
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, AgriSmartHandler)
    print("=" * 65)
    print(f"  [OK] AgriSmart AI Server running live at: http://localhost:{port}")
    print(f"  [OK] Network access: http://127.0.0.1:{port}")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8501
    run_server(port=port)