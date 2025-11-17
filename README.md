# JPool TypeScript SDK

TypeScript SDK for interacting with the JPool Solana liquid staking pool.



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

## Features

- **Deposit SOL** - Stake SOL and receive LST pool tokens
- **Withdraw SOL** - Unstake SOL instantly
- **Direct Staking** - Stake to specific validators
- **Pool Information** - Query pool state, rates, and fees
- **Balance Tracking** - Check direct stakes and wallet bindings

## Usage

### Deposit SOL

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

Support a specific validator while maintaining pool token liquidity:

```typescript
const validatorVoteAccount = new PublicKey('VALIDATOR_VOTE_ACCOUNT')

const { instructions, signers } = await client.depositSol({
  from: userPublicKey,
  lamports: 5 * LAMPORTS_PER_SOL,
  directVote: validatorVoteAccount, // Direct stake to this validator
})
```

### Withdraw SOL

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

### Withdraw Stake Account

Receive a delegated stake account instead of liquid SOL:

```typescript
const { instructions, signers } = await client.withdrawStake({
  from: userPublicKey,
  amount: poolTokensToBurn,
})
```

### Get Direct Stakes

Query your direct stake positions:

```typescript
const directStakes = await client.getDirectStakes({
  wallet: userPublicKey,
})

// Or query by validator
const validatorStakes = await client.getDirectStakes({
  vote: validatorVoteAccount,
})
```

## Configuration

### Custom Configuration

```typescript
import { STAKE_POOL_PROGRAM_ID } from '@solana/spl-stake-pool'

const client = new JPoolClient(connection, {
  poolAddress: new PublicKey('CUSTOM_POOL_ADDRESS'),
  programId: STAKE_POOL_PROGRAM_ID,
  refCode: 'YOUR_REFERRAL_CODE', // Optional referral tracking
})
```

### Update Configuration

```typescript
// Update individual options
client.configure('refCode', 'NEW_REFERRAL_CODE')
```

## API Reference

### JPoolClient

#### Methods

- `poolInfo(): Promise<StakePoolInfo>` - Get current pool state and statistics
- `poolTokenRate(poolInfo): number` - Calculate lamports per pool token exchange rate
- `reserveBalance(poolInfo): Promise<number>` - Get current reserve balance
- `depositSol(props): Promise<{instructions, signers}>` - Deposit SOL into the pool
- `depositStake(props): Promise<{instructions, signers}>` - Deposit stake account into the pool
- `withdrawSol(props): Promise<{instructions, signers}>` - Withdraw SOL from the pool
- `withdrawStake(props): Promise<{instructions, signers}>` - Withdraw as stake account
- `getDirectStakes(query): Promise<any>` - Query direct stake records
- `getWalletBindings(query): Promise<any>` - Query wallet bindings

## Important Notes

### Transaction Signing

All SDK methods return `{ instructions, signers }` where:
- **instructions** - Array of transaction instructions to add to your transaction
- **signers** - Ephemeral keypairs that must sign the transaction along with your wallet

**You must:**
1. Create a `Transaction` and add the instructions
2. Set the transaction's `recentBlockhash` and `feePayer`
3. Sign with ephemeral signers: `transaction.sign(...signers)`
4. Sign with your wallet (e.g., Phantom, Solflare)
5. Send the transaction to the network

### Pool Token Amounts

When withdrawing, the `amount` parameter is in **pool tokens**, not SOL:
```typescript
// Calculate SOL you'll receive
const poolInfo = await client.poolInfo()
const rate = client.poolTokenRate(poolInfo)
const expectedSOL = poolTokenAmount * rate
```

### Fees

All operations have fees that are automatically deducted:
- Deposit fee: Applied when depositing SOL
- Withdrawal fee: Applied when withdrawing SOL or stake

Check current fees:
```typescript
const poolInfo = await client.poolInfo()
console.log('Deposit fee:', poolInfo.solDepositFee * 100, '%')
console.log('Withdrawal fee:', poolInfo.solWithdrawalFee * 100, '%')
```

## Examples

See the `example/` directory for complete working examples:
- `example/deposit.ts` - Deposit operations and calculations
- `example/withdraw.ts` - Withdrawal operations and balance checking

Run examples:
```bash
npx tsx example/deposit.ts
npx tsx example/withdraw.ts
```

## Constants

```typescript
import { POOL_ADDRESS, POOL_MINT_ADDRESS } from '@jpool/sdk'

console.log('Pool address:', POOL_ADDRESS.toBase58())
console.log('Pool token mint:', POOL_MINT_ADDRESS.toBase58())
```

## Links

- [JPool Website](https://jpool.one)
- [JPool Documentation](https://docs.jpool.one)

## License

MIT
