#!/bin/bash

echo "=========================================================================="
echo "🚀 Starting NCPOR Antarctic Navigation & Decision Support System..."
echo "=========================================================================="

# Detect OS and set Python executable path for virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "venv/Scripts/python.exe" ]; then
        PYTHON_CMD="venv/Scripts/python.exe"
    else
        PYTHON_CMD="venv/Scripts/python"
    fi
else
    PYTHON_CMD="venv/bin/python"
fi

# Check if Python virtual environment exists
if [ ! -f "$PYTHON_CMD" ]; then
    echo "❌ Python virtual environment not found at: $PYTHON_CMD"
    echo ""
    echo "Please set up the environment before running:"
    echo "  1. python3 -m venv venv     # On Windows: python -m venv venv"
    echo "  2. $PYTHON_CMD -m pip install -r requirements.txt"
    echo ""
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 frontend/node_modules not found. Installing frontend dependencies..."
    (cd frontend && npm install)
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies."
        exit 1
    fi
fi

# 1. Start Python Flask API Server (Port 5000)
echo "1. Launching Flask Backend Server (Port 5000)..."
$PYTHON_CMD backend/app.py &
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
