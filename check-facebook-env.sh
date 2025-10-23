#!/bin/bash
echo "=== Facebook Environment Variables ==="
grep FACEBOOK /home/kids-toys/app/backend/.env
echo ""
echo "=== FRONTEND_URL ==="
grep FRONTEND_URL /home/kids-toys/app/backend/.env
echo ""
echo "=== Testing Facebook OAuth URL ==="
echo "Facebook OAuth URL: https://simba-tzatzuim.co.il/api/auth/facebook"
echo "Facebook Callback URL: https://simba-tzatzuim.co.il/api/auth/facebook/callback"
