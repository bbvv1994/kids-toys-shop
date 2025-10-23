#!/bin/bash
echo "Deploying frontend to server..."

# Copy static files
scp -r build/static/* root@simba-tzatzuim.co.il:/var/www/html/static/

# Copy index.html
scp build/index.html root@simba-tzatzuim.co.il:/var/www/html/

echo "Frontend deployed successfully!"



