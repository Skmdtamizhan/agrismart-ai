#!/usr/bin/env bash
echo "========================================================================"
echo "  Starting AgriSmart AI Web Application..."
echo "========================================================================"
if [ -d ".venv" ]; then
    .venv/bin/python app.py
else
    python3 app.py
fi