#!/usr/bin/env bash
set -euo pipefail

# Day 11: Solana Accounts vs Traditional Databases challenge runner.
# This script executes the CLI commands and writes a comparison table template.

DEVNET_URL="https://api.devnet.solana.com"
TOKEN_PROGRAM_ID="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
TABLE_FILE="comparison-table.md"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed or not on PATH." >&2
    exit 1
  fi
}

print_section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

write_comparison_table() {
  cat >"$TABLE_FILE" <<'EOF'
# Day 11 Comparison: Traditional Database vs Solana Accounts

| Concept | Traditional Database | Solana Accounts |
|---|---|---|
| Data location | Rows in tables on a centralized server | Accounts on a distributed ledger across validators |
| Schema | Defined by the database (SQL DDL, document schema) | Defined by the owning program; stored as raw bytes in the account's data field |
| Access control | Application-level auth (SQL roles, app middleware) | Enforced by the runtime: only the owning program can modify an account, and only with the required signer(s) |
| Cost of storage | Server/cloud hosting fees, pay for disk space | Rent-exempt deposit proportional to data size (query via `solana rent`); refundable when the account is closed |
| Identity/keys | Auto-increment IDs, UUIDs | 32-byte public keys or Program Derived Addresses (PDAs) |
| Reads | SQL queries, document lookups | RPC calls (`getAccountInfo`, `getProgramAccounts`) |
| Writes | INSERT/UPDATE via application code | Transactions with instructions, signed by authorized keys |
| Code vs data | Application code and database are separate systems | Both are accounts; programs (code) and data accounts coexist in the same model |
| Deletion | DELETE query removes the row | Close the account, lamports are returned to you |
| Visibility | Private by default; you choose what to expose | Public by default; anyone can read any account's data |

One key difference: accounts do not query each other. There is no JOIN, no server-side filtering. Programs receive accounts as inputs to instructions. If you want to "query" data, you do it off-chain via RPC and assemble results yourself.
EOF
  echo "Wrote $TABLE_FILE"
}

require_cmd solana

print_section "Step 0: Configure Solana CLI to devnet"
solana config set --url "$DEVNET_URL"
solana config get

print_section "Step 1: Inspect your wallet account"
WALLET_ADDRESS="$(solana address)"
echo "Wallet address: $WALLET_ADDRESS"
solana account "$WALLET_ADDRESS"

print_section "Step 2: Inspect Token Program account"
solana account "$TOKEN_PROGRAM_ID"

print_section "Step 3: Build comparison table file"
write_comparison_table

print_section "Step 4: Check rent-exempt costs"
solana rent 0
solana rent 100
solana rent 1000

print_section "Optional: Request devnet airdrop"
echo "Attempting: solana airdrop 2"
if ! solana airdrop 2; then
  echo "Airdrop 2 failed. Retrying with: solana airdrop 1"
  if ! solana airdrop 1; then
    echo "Airdrop failed again (likely rate limit). Try later or use the web faucet."
  fi
fi

print_section "Step 5: Explorer link"
echo "Open this URL in your browser:"
echo "https://explorer.solana.com/address/${WALLET_ADDRESS}?cluster=devnet"

print_section "Done"
echo "Commands completed. Review $TABLE_FILE and add your own notes if needed."
