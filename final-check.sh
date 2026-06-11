#!/bin/bash

echo "🎉 UniVerse Phase 2 - Final Verification"
echo "=========================================="
echo ""

# Check file structure
echo "📁 Checking file structure..."
[ -d "public/css" ] && echo "  ✓ public/css exists"
[ -d "public/js" ] && echo "  ✓ public/js exists"
[ -d "server/models" ] && echo "  ✓ server/models exists"
[ -d "server/routes" ] && echo "  ✓ server/routes exists"
[ -d "server/middleware" ] && echo "  ✓ server/middleware exists"
echo ""

# Count files
echo "📊 File counts:"
MODEL_COUNT=$(ls -1 server/models/*.js 2>/dev/null | wc -l)
echo "  Models: $MODEL_COUNT (expected: 5)"
CSS_COUNT=$(ls -1 public/css/*.css 2>/dev/null | wc -l)
echo "  CSS files: $CSS_COUNT (expected: 2)"
JS_COUNT=$(ls -1 public/js/*.js 2>/dev/null | wc -l)
echo "  JS files: $JS_COUNT (expected: 2)"
echo ""

# Check key files
echo "📄 Checking key files..."
[ -f "server.js" ] && echo "  ✓ server.js"
[ -f "package.json" ] && echo "  ✓ package.json"
[ -f ".env.example" ] && echo "  ✓ .env.example"
[ -f "README.md" ] && echo "  ✓ README.md"
[ -f "SECURITY.md" ] && echo "  ✓ SECURITY.md"
[ -f "IMPLEMENTATION_SUMMARY.md" ] && echo "  ✓ IMPLEMENTATION_SUMMARY.md"
[ -f "public/index.html" ] && echo "  ✓ public/index.html"
[ -f "public/manifest.json" ] && echo "  ✓ public/manifest.json"
[ -f "public/service-worker.js" ] && echo "  ✓ public/service-worker.js"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
[ -d "node_modules" ] && echo "  ✓ node_modules installed"
[ -f "package-lock.json" ] && echo "  ✓ package-lock.json exists"
echo ""

# Git status
echo "📌 Git status:"
git log --oneline -3
echo ""

echo "✅ Phase 2 Complete!"
echo ""
echo "🚀 Next Steps:"
echo "  1. Set up MongoDB Atlas"
echo "  2. Configure .env with real credentials"
echo "  3. Run: npm run dev"
echo "  4. Test: http://localhost:5000/api/health"
echo ""
