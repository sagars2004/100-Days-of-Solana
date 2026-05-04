#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root from this script's location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Error: .env not found at ${ENV_FILE}" >&2
  exit 1
fi

# Export variables from .env so DAY11_WALLET_ADDRESS is available.
set -a
source "${ENV_FILE}"
set +a

if [[ -z "${DAY11_WALLET_ADDRESS:-}" ]]; then
  echo "Error: DAY11_WALLET_ADDRESS is missing in ${ENV_FILE}" >&2
  exit 1
fi

AMOUNT="${1:-0.001}"

solana transfer \
  --allow-unfunded-recipient \
  "${DAY11_WALLET_ADDRESS}" \
  "${AMOUNT}" \
  --url devnet
