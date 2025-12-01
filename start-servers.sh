#!/bin/bash

# Kill any existing servers
echo "🛑 Stopping any existing servers..."
pkill -f "node index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd /Users/shivin/Codes/Aadat-new/server
node index.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd /Users/shivin/Codes/Aadat-new/client-react
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

# Check if servers are running
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SERVERS STARTED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Backend Log:  /tmp/backend.log"
echo "Frontend Log: /tmp/frontend.log"
echo ""

# Show last lines of logs
echo "📡 Backend Status:"
tail -3 /tmp/backend.log
echo ""
echo "🌐 Frontend Status:"
tail -5 /tmp/frontend.log
echo ""

# Check ports
echo "🔍 Checking ports..."
lsof -i :3000 -i :5173 -i :5174 | grep LISTEN
echo ""

# Get the actual frontend port
FRONTEND_PORT=$(tail -10 /tmp/frontend.log | grep -oE 'localhost:[0-9]+' | head -1 | cut -d: -f2)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 OPEN IN BROWSER:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   👉  http://localhost:${FRONTEND_PORT:-5173}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  To stop servers, run:"
echo "   pkill -f 'node index.js' && pkill -f 'vite'"
echo ""

# Open browser
open "http://localhost:${FRONTEND_PORT:-5173}"
