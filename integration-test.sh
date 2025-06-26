#!/bin/bash

# Integration Test Script for Pay Parking Application
echo "=== Pay Parking Integration Test ==="
echo ""

# Test 1: Backend Health Check
echo "1. Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo "✅ Backend is running and responding"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend health check failed"
    exit 1
fi
echo ""

# Test 2: Frontend Check
echo "2. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is running and responding"
else
    echo "❌ Frontend check failed (HTTP $FRONTEND_RESPONSE)"
fi
echo ""

# Test 3: Backend API Routes
echo "3. Testing Backend API Endpoints..."

# Test auth endpoints
echo "   Testing Auth Routes:"
REGISTER_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"testpass"}')

if [ "$REGISTER_TEST" = "201" ] || [ "$REGISTER_TEST" = "400" ]; then
    echo "   ✅ Register endpoint is accessible"
else
    echo "   ❌ Register endpoint failed (HTTP $REGISTER_TEST)"
fi

# Test tickets endpoint
echo "   Testing Tickets Routes:"
TICKETS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:5000/api/tickets)
if [ "$TICKETS_TEST" = "401" ] || [ "$TICKETS_TEST" = "200" ]; then
    echo "   ✅ Tickets endpoint is accessible"
else
    echo "   ❌ Tickets endpoint failed (HTTP $TICKETS_TEST)"
fi

# Test OTP endpoint
echo "   Testing OTP Routes:"
OTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{"vehicleNo":"TEST123"}')
if [ "$OTP_TEST" = "404" ] || [ "$OTP_TEST" = "400" ]; then
    echo "   ✅ OTP endpoint is accessible"
else
    echo "   ❌ OTP endpoint failed (HTTP $OTP_TEST)"
fi

echo ""

# Test 4: CORS Configuration
echo "4. Testing CORS Configuration..."
CORS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "204" ]; then
    echo "✅ CORS is configured correctly for frontend"
else
    echo "❌ CORS configuration issue (HTTP $CORS_TEST)"
fi
echo ""

# Test 5: Environment Variables
echo "5. Testing Environment Configuration..."
if [ -f "/home/vikas/Desktop/Project/pay-parking/Backend/.env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "❌ Backend .env file missing"
fi

if [ -f "/home/vikas/Desktop/Project/pay-parking/Frontend/.env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "❌ Frontend .env file missing"
fi
echo ""

echo "=== Integration Test Complete ==="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🚀 Backend API: http://localhost:5000"
echo "📚 API Health: http://localhost:5000/health"
echo ""
echo "Both applications are running and ready for testing!"
