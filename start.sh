#!/bin/bash

# Aadat - Startup Script
# This script starts both backend and frontend servers

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting Aadat Application..."
echo ""

# Start backend server
echo "📦 Starting Backend Server..."
cd "$SCRIPT_DIR/server" && npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on http://localhost:3000"

# Wait a moment for backend to initialize
sleep 2

# Start frontend server
echo "⚛️  Starting Frontend Server..."
cd "$SCRIPT_DIR/client-react" && npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) on http://localhost:5173"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Aadat is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3000"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to exit (servers will keep running)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep script running to show status
sleep 3

# Check if servers are still running
if ps -p $BACKEND_PID > /dev/null && ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Both servers are running successfully!"
    echo ""
    echo "Recent backend logs:"
    tail -5 /tmp/backend.log
else
    echo "⚠️  Warning: One or more servers may have failed to start"
    echo "Check logs for details"
fi
