#!/usr/bin/env bash
set -e

# ==============================================================================
# BLUFF Escrow Smart Contract - NEAR Testnet Deployment Script
# ==============================================================================

CONTRACT_NAME=${1:-"bluff-escrow.testnet"}
WASM_PATH="./contracts/bluff_escrow.wasm"

echo "========================================================"
echo "🎯 Deploying BLUFF Escrow to NEAR Testnet: $CONTRACT_NAME"
echo "========================================================"

if [ ! -f "$WASM_PATH" ]; then
    echo "⚠️ WASM not found at $WASM_PATH, building release..."
    cd contracts/bluff_escrow
    cargo build --target wasm32-unknown-unknown --release
    cp target/wasm32-unknown-unknown/release/bluff_escrow.wasm ../bluff_escrow.wasm
    cd ../..
fi

echo "📦 WASM binary verified: $(ls -lh $WASM_PATH | awk '{print $5}')"

# Check if near CLI is installed
if command -v near &> /dev/null; then
    echo "🚀 Deploying with near-cli..."
    near deploy "$CONTRACT_NAME" "$WASM_PATH" --initFunction new --initArgs "{\"owner_id\": \"$CONTRACT_NAME\"}"
    echo "✅ Contract deployed & initialized successfully!"
else
    echo "ℹ️ Note: Install 'near-cli' (npm i -g near-cli) or 'cargo-near' to deploy from terminal."
    echo "Command to run:"
    echo "near deploy $CONTRACT_NAME $WASM_PATH --initFunction new --initArgs '{\"owner_id\": \"'$CONTRACT_NAME'\"}'"
fi

