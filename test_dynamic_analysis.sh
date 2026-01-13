#!/bin/bash

# Test script to verify the dynamic analysis functionality

echo "Testing dynamic stock analysis system..."

# Start the Python service in background
cd python-service
python main.py &
PYTHON_PID=$!

# Wait for service to start
sleep 3

# Test the analysis endpoint with sample data
echo "Testing analysis endpoint..."
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "000001",
    "stock_data": {
      "basic": {
        "symbol": "000001",
        "name": "平安银行",
        "market": "A",
        "currentPrice": 12.5,
        "peRatio": 8.5,
        "pbRatio": 0.8,
        "dividendYield": 4.2
      },
      "financial": {
        "revenue": 15000000000,
        "netProfit": 2000000000,
        "roe": 12.5,
        "debtRatio": 85
      }
    }
  }' | jq '.'

# Kill the background process
kill $PYTHON_PID

echo "Test completed."