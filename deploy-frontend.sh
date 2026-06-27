#!/bin/bash
# ============================================================
# deploy-frontend.sh
# 
# Sirf admin-frontend ka React build deploy karta hai.
# Backend touch nahi hota — alag chal raha hai.
#
# Usage:
#   chmod +x deploy-frontend.sh
#   ./deploy-frontend.sh
# ============================================================

set -e  # Koi bhi error aaye toh script rok do

PROJECT_DIR="/var/www/Shopify_Clone"
FRONTEND_DIR="$PROJECT_DIR/admin-frontend"
NGINX_CONF_SRC="$PROJECT_DIR/nginx/storefront-wildcard.conf"
NGINX_CONF_DEST="/etc/nginx/sites-available/storefront-wildcard.conf"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/storefront-wildcard.conf"

echo "========================================"
echo " Storefront Frontend Deploy"
echo " Backend untouched — stays running ✅"
echo "========================================"

# ── Step 1: Latest code pull ──────────────────────────────
echo ""
echo "📥 [1/4] Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# ── Step 2: Frontend build ────────────────────────────────
echo ""
echo "🔨 [2/4] Building admin-frontend (React)..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build

echo "✅ Build complete → $FRONTEND_DIR/dist"

# ── Step 3: Nginx wildcard config setup (only if needed) ──
echo ""
echo "⚙️  [3/4] Setting up nginx wildcard config..."

if [ ! -f "$NGINX_CONF_DEST" ]; then
    sudo cp "$NGINX_CONF_SRC" "$NGINX_CONF_DEST"
    echo "   Config copied to sites-available"
else
    sudo cp "$NGINX_CONF_SRC" "$NGINX_CONF_DEST"
    echo "   Config updated"
fi

if [ ! -L "$NGINX_CONF_LINK" ]; then
    sudo ln -s "$NGINX_CONF_DEST" "$NGINX_CONF_LINK"
    echo "   Symlink created in sites-enabled"
else
    echo "   Symlink already exists"
fi

# ── Step 4: Nginx reload ──────────────────────────────────
echo ""
echo "🔄 [4/4] Reloading nginx..."
sudo nginx -t
sudo nginx -s reload

echo ""
echo "========================================"
echo " ✅ Frontend Deploy Complete!"
echo ""
echo " Backend:  Still running on port 5000 ✅"
echo " Frontend: Served from $FRONTEND_DIR/dist"
echo ""
echo " Any merchant domain pointing to this"
echo " server IP will now auto-serve their"
echo " storefront. No per-domain setup needed!"
echo "========================================"
