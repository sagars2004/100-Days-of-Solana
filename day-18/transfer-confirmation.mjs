import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import {
	address,
	createKeyPairSignerFromBytes,
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	pipe,
	createTransactionMessage,
	setTransactionMessageFeePayerSigner,
	setTransactionMessageLifetimeUsingBlockhash,
	appendTransactionMessageInstruction,
	signTransactionMessageWithSigners,
	getSignatureFromTransaction,
	getBase64EncodedWireTransaction,
	sendAndConfirmTransactionFactory,
	lamports,
	devnet,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

// --- Configuration ---
const RPC_URL = devnet("https://api.devnet.solana.com");
const WS_URL = devnet("wss://api.devnet.solana.com");
const LAMPORTS_PER_SOL = 1_000_000_000n;

// --- Parse command-line arguments ---
const args = process.argv.slice(2);
if (args.length < 2) {
	console.error("Usage: node transfer-confirmation.mjs <RECIPIENT_ADDRESS> <AMOUNT_IN_SOL>");
	
	process.exit(1);
}

const recipientAddress = address(args[0]);
const solAmount = parseFloat(args[1]);

if (isNaN(solAmount) || solAmount <= 0) {
	console.error("Error: Amount must be a positive number.");
	process.exit(1);
}

const transferLamports = lamports(BigInt(Math.round(solAmount * Number(LAMPORTS_PER_SOL))));

// --- Load your keypair from the default Solana CLI location ---
async function loadKeypair() {
	const keypairPath = resolve(homedir(), ".config", "solana", "id.json");
	const secretKeyJson = await readFile(keypairPath, "utf-8");
	const secretKeyBytes = new Uint8Array(JSON.parse(secretKeyJson));
	const keyPair = await createKeyPairSignerFromBytes(secretKeyBytes);
	return keyPair;
}

// --- Main function ---
async function main() {
	console.log("Solana Transfer Tool");
	console.log("====================\n");

	// 1. Connect to devnet
	const rpc = createSolanaRpc(RPC_URL);
	const rpcSubscriptions = createSolanaRpcSubscriptions(WS_URL);
	console.log("Connected to Solana devnet.\n");

	// 2. Load the sender keypair
	const sender = await loadKeypair();
	console.log("Sender:", sender.address);
	console.log("Recipient:", recipientAddress.toString());
	console.log("Amount:", solAmount, "SOL\n");

	// 3. Check the sender's balance
	const { value: balance } = await rpc.getBalance(sender.address).send();
	const balanceInSol = Number(balance) / Number(LAMPORTS_PER_SOL);
	console.log(`Sender balance: ${balanceInSol} SOL`);

	if (balance < transferLamports) {
		console.error(
			`\nInsufficient funds. You need at least ${solAmount} SOL plus a small fee.`
		);
		console.error("Get more devnet SOL at https://faucet.solana.com/");
		process.exit(1);
	}

	try {
		const signature = await transferWithConfirmation(
			rpc,
			rpcSubscriptions,
			sender,
			recipientAddress,
			solAmount
		);
        console.log("Transaction successful!");
        console.log(`Signature: ${signature}`);
        console.log(`View on Solana Explorer:`);
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (error) {
        console.error("\nTransaction failed:");
        console.error(error.message);
        process.exit(1);
    }

	// 7. Show updated balance
	const { value: newBalance } = await rpc.getBalance(sender.address).send();
	const newBalanceInSol = Number(newBalance) / Number(LAMPORTS_PER_SOL);
	console.log(`\nNew sender balance: ${newBalanceInSol} SOL`);
}

function statusUpdate(message) {
	if (process.stdout.isTTY) {
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(message);
	} else {
		process.stdout.write(`${message}\n`);
	}
}

async function transferWithConfirmation(
	rpc,
	rpcSubscriptions,
	sender,
	recipientAddress,
	solAmount
) {
	const lamportsAmount = lamports(
		BigInt(Math.round(solAmount * Number(LAMPORTS_PER_SOL)))
	);
	const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

	const transactionMessage = pipe(
		createTransactionMessage({ version: 0 }),
		(tx) => setTransactionMessageFeePayerSigner(sender, tx),
		(tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
		(tx) =>
			appendTransactionMessageInstruction(
				getTransferSolInstruction({
					source: sender,
					destination: recipientAddress,
					amount: lamportsAmount,
				}),
				tx
			)
	);

	statusUpdate("Signing transaction…");
	const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
	const signature = getSignatureFromTransaction(signedTransaction);
	const wireB64 = getBase64EncodedWireTransaction(signedTransaction);
	console.log(`\nWire payload (base64): ${wireB64.length} characters`);

	const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
	let tick = 0;
	const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let interval;
	if (process.stdout.isTTY) {
		interval = setInterval(() => {
			statusUpdate(`Sending / confirming ${spinner[tick % spinner.length]}`);
			tick++;
		}, 80);
	} else {
		console.log("Sending and confirming…");
	}
	try {
		await sendAndConfirm(signedTransaction, { commitment: "confirmed" });
	} finally {
		if (interval) clearInterval(interval);
	}
	process.stdout.write("\n");
	return signature;
}

main().catch((err) => {
	console.error("\nTransfer failed:", err.message);
	process.exit(1);
});