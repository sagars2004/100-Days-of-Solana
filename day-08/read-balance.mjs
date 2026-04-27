import { createSolanaRpc, devnet, address } from "@solana/kit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect to devnet (Solana's test network)
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

const walletAddressFromEnv =
  process.env.DAY04_PHANTOM_WALLET_ADDRESS ||
  process.env.DAY03_SOLANA_WALLET_ADDRESS ||
  process.env.DAY01_WALLET_ADDRESS;

if (!walletAddressFromEnv) {
  console.error(
    "Missing wallet address in ../.env. Set DAY04_PHANTOM_WALLET_ADDRESS (or DAY03_SOLANA_WALLET_ADDRESS / DAY01_WALLET_ADDRESS)."
  );
  process.exit(1);
}

const targetAddress = address(walletAddressFromEnv);

// Query the balance, just like calling a REST API
const { value: balanceInLamports } = await rpc
  .getBalance(targetAddress)
  .send();

// Lamports are Solana's smallest unit. 1 SOL = 1,000,000,000 lamports.
// You learned about this on Day 3.
const balanceInSol = Number(balanceInLamports) / 1_000_000_000;

console.log(`Address: ${targetAddress}`);
console.log(`Balance: ${balanceInSol} SOL`);