# Day 05 Reflection: Wallet Tradeoffs

After using CLI, browser, and mobile wallets, I learned that they all control the same thing (a Solana keypair), but they optimize for different priorities.

## Quick Comparison

### Which wallet was fastest to set up?
The CLI wallet was fastest for me because I could generate and use it immediately from a terminal command with no extension install, onboarding flow, or UI steps.

### Which felt safest?
The mobile wallet felt safest in daily use because the phone provides stronger isolation and can use hardware-backed protections (biometrics, secure enclave style storage depending on device). A hardware wallet would be safest overall, but among these three, mobile felt strongest.

### Where is the private key stored in each case?
- **CLI wallet:** In a local file on disk (for this project, a JSON key file such as `day-02/wallet.json` with secret key bytes).
- **Browser wallet:** Encrypted inside the browser extension's local extension storage, protected by the wallet password/seed phrase recovery flow.
- **Mobile wallet:** Encrypted in app storage on the phone, often backed by device-level secure storage and biometric/PIN access.

### If my laptop caught fire right now, which wallets could I recover, and how?
- **CLI wallet:** Recoverable only if I backed up the key file or saved the seed/private key elsewhere. If the file existed only on this laptop, funds are effectively lost.
- **Browser wallet:** Recoverable with the wallet's seed phrase on a new device/extension.
- **Mobile wallet:** Recoverable with the wallet's seed phrase on a new phone.

## Which Wallet for Which Use Case

### 500 scripted test transactions
I would choose the **CLI wallet**. It is scriptable, fast, and has no per-transaction confirmation popup, which is ideal for automation and local/devnet testing.

### Holding $10,000 in SOL
I would choose a **mobile wallet over CLI**, and ideally a **hardware wallet** for serious long-term storage. For the three compared here, mobile is my pick because it offers stronger key isolation than a plaintext key file on a laptop.

## Final Takeaway

The best wallet depends on intent:
- **CLI** for speed, automation, and development scripts.
- **Browser** for regular dApp interaction with explicit approvals.
- **Mobile** for better day-to-day security and personal custody habits.

There is no single best wallet. The right answer changes based on convenience needs, security requirements, and recovery discipline.
