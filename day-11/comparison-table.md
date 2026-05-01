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
