# JPool TypeScript SDK

TypeScript SDK for interacting with the JPool liquid staking pool on Solana. The SDK provides the following features:

- Stake SOL and receive LST pool tokens
- Unstake SOL instantly
- Stake to specific validators
- Query pool state, rates, and fees
- Check direct stakes and wallet bindings

## Table of contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Important Notes](#important-notes)
- [Examples](#examples)
- [Constants](#constants)
- [API Reference](#api-reference)
- [Links](#links)
- [License](#license)

## Installation

```bash
npm install @jpool/sdk
# or
pnpm add @jpool/sdk
# or
yarn add @jpool/sdk
```

## Quick Start

```typescript
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { JPoolClient } from '@jpool/sdk'

// Create connection and client
const connection = new Connection(clusterApiUrl('mainnet-beta'))
const client = new JPoolClient(connection)

// Get pool information
const poolInfo = await client.poolInfo()
console.log('Total staked:', Number(poolInfo.totalLamports) / LAMPORTS_PER_SOL, 'SOL')

// Calculate exchange rate
const rate = client.poolTokenRate(poolInfo)
console.log('Exchange rate:', rate, 'lamports per pool token')
```
## Usage

- [Deposit SOL](#deposit-sol)
- [Deposit with Direct Staking](#deposit-with-direct-staking)
- [Withdraw SOL](#withdraw-sol)
- [Withdraw stake account](#withdraw-stake-account)
- [Get direct stake](#get-direct-stake)

### Deposit SOL

Stake SOL and receive liquid pool tokens:

```typescript
import { Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS')

// Get deposit instructions
const { instructions, signers } = await client.depositSol({
  from: userPublicKey,
  lamports: 1 * LAMPORTS_PER_SOL,
})

// Create and configure transaction
const transaction = new Transaction().add(...instructions)
const { blockhash } = await connection.getLatestBlockhash()
transaction.recentBlockhash = blockhash
transaction.feePayer = userPublicKey

// Sign with ephemeral signers first, then with your wallet
transaction.sign(...signers)
// ... sign with wallet and send transaction
```

### Deposit with Direct Staking

Stake to specific validators:

```typescript
const validatorVoteAccount = new PublicKey('VALIDATOR_VOTE_ACCOUNT')

const { instructions, signers } = await client.depositSol({
  from: userPublicKey,
  lamports: 5 * LAMPORTS_PER_SOL,
  directVote: validatorVoteAccount, // Direct stake to this validator
})
```

### Withdraw SOL

Unstake pool token to receive SOL:

```typescript
// Amount is in pool tokens, not SOL
const poolTokensToBurn = 10

const { instructions, signers } = await client.withdrawSol({
  from: userPublicKey,
  amount: poolTokensToBurn,
})

// Create transaction (same pattern as deposit)
const transaction = new Transaction().add(...instructions)
// ... configure, sign, and send
```

### Withdraw stake account

Receive a delegated stake account:

```typescript
const { instructions, signers } = await client.withdrawStake({
  from: userPublicKey,
  amount: poolTokensToBurn,
})
```

### Get direct stake

Query direct stake positions by wallet or validator:

```typescript
// By wallet
const directStakes = await client.getDirectStakes({
  wallet: userPublicKey,
})

// By validator
const validatorStakes = await client.getDirectStakes({
  vote: validatorVoteAccount,
})
```

## Configuration

Add custom configuration:

```typescript
import { STAKE_POOL_PROGRAM_ID } from '@solana/spl-stake-pool'

const client = new JPoolClient(connection, {
  poolAddress: new PublicKey('CUSTOM_POOL_ADDRESS'),
  programId: STAKE_POOL_PROGRAM_ID,
  refCode: 'YOUR_REFERRAL_CODE', // Optional referral tracking
})
```

Update configuration:

```typescript
// Update individual options
client.configure('refCode', 'NEW_REFERRAL_CODE')
```

## Important notes

### Transaction signing

All transaction-building methods return `{ instructions, signers }` where:
- `instructions`: Array of transaction instructions to add to your transaction.
- `signers`: Ephemeral keypairs that must sign the transaction along with your wallet.

**You must:**
1. Create a `Transaction` and add the instructions.
2. Set the transaction's `recentBlockhash` and `feePayer`.
3. Sign with ephemeral signers: `transaction.sign(...signers)`.
4. Sign with your wallet (e.g., Phantom, Solflare).
5. Send the transaction to the network.

### Pool token amounts

When withdrawing, the `amount` parameter is in **pool tokens**, not SOL:
```typescript
// Calculate SOL you'll receive
const poolInfo = await client.poolInfo()
const rate = client.poolTokenRate(poolInfo)
const expectedSOL = poolTokenAmount * rate
```

### Fees

All operations have fees that are automatically deducted:
- Deposit fee: Applied when depositing SOL.
- Withdrawal fee: Applied when withdrawing SOL or unstaking.

Check current fees:
```typescript
const poolInfo = await client.poolInfo()
console.log('Deposit fee:', poolInfo.solDepositFee * 100, '%')
console.log('Withdrawal fee:', poolInfo.solWithdrawalFee * 100, '%')
```

## Examples

See the `example/` directory for complete working examples:
- `example/deposit.ts`: Deposit operations and calculations.
- `example/withdraw.ts`: Withdrawal operations and balance checking.
- `example/info.ts`: Inspect pool state and relations.

Run examples:
```bash
npx tsx example/deposit.ts
npx tsx example/withdraw.ts
npx tsx example/info.ts
```

## Constants

```typescript
import { POOL_ADDRESS, POOL_MINT_ADDRESS } from '@jpool/sdk'

console.log('Pool address:', POOL_ADDRESS.toBase58())
console.log('Pool token mint:', POOL_MINT_ADDRESS.toBase58())
```

## API reference

| Method                                   | Returns                            | Description                                      |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `poolInfo()`                             | `Promise<StakePoolInfo>`          | Get current pool state and statistics           |
| `poolTokenRate(poolInfo)`               | `number`                          | Lamports per pool token exchange rate           |
| `reserveBalance(poolInfo)`              | `Promise<number>`                 | Get current reserve balance in lamports         |
| `depositSol(props)`                     | `Promise<{ instructions, signers }>` | Deposit SOL into the pool                   |
| `depositStake(props)`                   | `Promise<{ instructions, signers }>` | Delegate a stake account to the pool         |
| `withdrawSol(props)`                    | `Promise<{ instructions, signers }>` | Withdraw SOL from the pool                |
| `withdrawStake(props)`                  | `Promise<{ instructions, signers }>` | Withdraw as a delegated stake account           |
| `getDirectStakes(query)`                | `Promise<DirectStakeRecord[]>`   | Query direct stake records                      |
| `getWalletBindings(query)`              | `Promise<WalletBinding[]>`       | Query wallet binding records                    |

## Links

- JPool website: [https://jpool.one](https://jpool.one)
- JPool documentation: [https://docs.jpool.one](https://docs.jpool.one)

## License

MIT
