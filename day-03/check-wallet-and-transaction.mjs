import { createSolanaRpc, devnet, address } from "@solana/kit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LAMPORTS_PER_SOL = 1_000_000_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const walletAddressFromEnv = process.env.DAY03_SOLANA_WALLET_ADDRESS;
const latestSignature = process.env.DAY03_LATEST_TRANSACTION_SIGNATURE;

if (!walletAddressFromEnv) {
  console.error("Missing DAY03_SOLANA_WALLET_ADDRESS in ../.env");
  process.exit(1);
}

if (!latestSignature) {
  console.error("Missing DAY03_LATEST_TRANSACTION_SIGNATURE in ../.env");
  process.exit(1);
}

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

console.log("=== Day 03: Devnet Wallet + Transaction Inspector ===");
console.log(`Wallet address: ${walletAddressFromEnv}`);

const { value: lamportsBalance } = await rpc
  .getBalance(address(walletAddressFromEnv))
  .send();

const lamports = Number(lamportsBalance);
const sol = lamports / LAMPORTS_PER_SOL;
const roundTripLamports = sol * LAMPORTS_PER_SOL;

console.log("\nBalance:");
console.log(`- Lamports (raw): ${lamports.toLocaleString()} lamports`);
console.log(
  `- SOL conversion: ${lamports.toLocaleString()} / ${LAMPORTS_PER_SOL.toLocaleString()} = ${sol} SOL`
);
console.log(
  `- Reverse check: ${sol} * ${LAMPORTS_PER_SOL.toLocaleString()} = ${roundTripLamports.toLocaleString()} lamports`
);

console.log("\nLatest transaction lookup:");
console.log(`- Signature: ${latestSignature}`);

const tx = await rpc
  .getTransaction(latestSignature, {
    encoding: "json",
    maxSupportedTransactionVersion: 0,
  })
  .send();

if (!tx) {
  console.log("- Result: Transaction not found on devnet.");
  process.exit(0);
}

console.log("- Result: Transaction found.");
console.log(`- Slot: ${tx.slot}`);
console.log(`- Block time (unix): ${tx.blockTime ?? "N/A"}`);
console.log(`- Fee: ${tx.meta?.fee ?? "N/A"} lamports`);
console.log(`- Status: ${tx.meta?.err ? "Failed" : "Success"}`);
