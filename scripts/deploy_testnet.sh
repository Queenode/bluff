#!/usr/bin/env bash
# Build the BLUFF contract and deploy it to a fresh (or existing) testnet account.
# Requires: near-cli-rs (`npm i -g near-cli-rs`), cargo-near (`cargo install cargo-near`).
#
#   ./scripts/deploy_testnet.sh <contract-account.testnet> <oracle-account.testnet>
set -euo pipefail

CONTRACT=${1:?usage: deploy_testnet.sh <contract.testnet> <oracle.testnet>}
ORACLE=${2:?usage: deploy_testnet.sh <contract.testnet> <oracle.testnet>}

(cd contracts/bluff_escrow && cargo test && cargo near build non-reproducible-wasm)
cp contracts/bluff_escrow/target/near/bluff_escrow.wasm contracts/bluff_escrow.wasm

for acct in "$CONTRACT" "$ORACLE"; do
  if ! near account view-account-summary "$acct" network-config testnet now >/dev/null 2>&1; then
    near account create-account sponsor-by-faucet-service "$acct" autogenerate-new-keypair \
      save-to-legacy-keychain network-config testnet create
  fi
done

near contract deploy "$CONTRACT" use-file contracts/bluff_escrow.wasm \
  with-init-call new json-args "{\"owner_id\":\"$CONTRACT\",\"oracle_id\":\"$ORACLE\"}" \
  prepaid-gas '30 Tgas' attached-deposit '0 NEAR' \
  network-config testnet sign-with-legacy-keychain send

echo
echo "Deployed. Put these in .env.local:"
echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT"
echo "ORACLE_ACCOUNT_ID=$ORACLE"
echo "ORACLE_PRIVATE_KEY=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.near-credentials/testnet/$ORACLE.json')))['private_key'])")"
