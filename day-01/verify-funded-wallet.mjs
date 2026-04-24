import {
    createSolanaRpc,
    devnet,
    address,
  } from "@solana/kit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
  
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
  
  if (!process.env.DAY01_WALLET_ADDRESS) {
    console.error("Missing DAY01_WALLET_ADDRESS in ../.env");
    process.exit(1);
  }

  const walletAddress = process.env.DAY01_WALLET_ADDRESS;

  console.log("Wallet address:", walletAddress);
  
  // To check a specific address you've already funded, replace the line below:
  // const { value: balance } = await rpc.getBalance(address("YOUR_ADDRESS_HERE")).send();
  const { value: balance } = await rpc.getBalance(address(walletAddress)).send();
  const balanceInSol = Number(balance) / 1_000_000_000;
  
  console.log(`Balance: ${balanceInSol} SOL`);
  