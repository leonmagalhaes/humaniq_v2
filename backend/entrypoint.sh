#!/bin/sh

echo "▶ Executando seed.py..."
python seed.py

echo "🚀 Iniciando servidor Gunicorn..."
gunicorn --bind 0.0.0.0:5000 run:app
