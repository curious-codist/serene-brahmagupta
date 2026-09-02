#!/bin/bash

echo "=========================================================================="
echo "🚀 Starting NCPOR Antarctic Navigation & Decision Support System..."
echo "=========================================================================="

# 1. Start Python Flask API Server (Port 5000)
echo "1. Launching Python AI/ML Backend Server (Port 5000)..."
./venv/bin/python backend/app.py &
BACKEND_PID=$!

sleep 2

# 2. Start React Web Application (Port 3000)
echo "2. Launching Web Decision Support Deck (Port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "=========================================================================="
echo "✨ System Successfully Running!"
echo "🌐 Open Web Application:  http://localhost:3000"
echo "📡 Python API Server:    http://localhost:5000/api/health"
echo "=========================================================================="
echo "Press CTRL+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
