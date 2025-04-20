#!/bin/bash

echo "📦 Installing dependencies..."
npm install

echo "🌐 Installing Playwright browsers..."
npx playwright install

echo "🗄️ Setting up the database..."
sqlite3 db/accounts.db < db/schema.sql

echo "🚀 Starting the server in background..."
node src/app.js &

# Give the server a few seconds to start
sleep 3

echo "✅ Running Functional Tests..."
npx playwright test test/functional/functional_test.spec.js

echo "✅ Running Metamorphic Relation (MR) Tests..."
npx playwright test test/playwright/mr_test.spec.js

echo "🧪 Running Mutation Analysis with Functional Tests..."
cp stryker.functional.conf.js stryker.conf.js
npx stryker run

echo "🧪 Running Mutation Analysis with MR-Based Tests..."
cp stryker.mr.conf.js stryker.conf.js
npx stryker run

echo "✅ Done! 🎉"
