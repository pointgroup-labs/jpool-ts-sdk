import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js'
import { JPoolClient } from '../src'

/**
 * Example: Deposit SOL into the stake pool
 *
 * This example demonstrates how to deposit native SOL into the JPool stake pool
 * and receive pool tokens (liquid staking tokens) in return.
 */
async function depositSolExample() {
  console.log('\n=== Deposit SOL Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  // Replace with your wallet's public key
  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')

  // Amount to deposit (1 SOL in this example)
  const amountToDeposit = 1 * LAMPORTS_PER_SOL

  console.log('Depositing:', amountToDeposit / LAMPORTS_PER_SOL, 'SOL')

  try {
    // Get deposit instructions and ephemeral signers
    const { instructions, signers } = await client.depositSol({
      from: userPublicKey,
      lamports: amountToDeposit,
    })

    // Create transaction and add instructions
    const transaction = new Transaction().add(...instructions)

    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('✓ Transaction prepared')
    console.log('  Instructions:', instructions.length)
    console.log('  Ephemeral signers:', signers.length)

    // Sign and send the transaction:
    // 1. transaction.sign(...signers) // Sign with ephemeral signers
    // 2. Sign with your wallet (e.g., Phantom, Solflare)
    // 3. const signature = await connection.sendRawTransaction(transaction.serialize())
    // 4. await connection.confirmTransaction(signature)
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Deposit SOL with direct stake to a specific validator
 *
 * Direct staking allows you to support a specific validator while maintaining
 * pool token liquidity.
 */
async function depositSolWithDirectStakeExample() {
  console.log('\n=== Deposit with Direct Stake Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')
  const validatorVoteAccount = new PublicKey('VALIDATOR_VOTE_ACCOUNT_HERE')

  const amountToDeposit = 5 * LAMPORTS_PER_SOL

  console.log('Depositing:', amountToDeposit / LAMPORTS_PER_SOL, 'SOL')
  console.log('To validator:', validatorVoteAccount.toBase58())

  try {
    const { instructions, signers } = await client.depositSol({
      from: userPublicKey,
      lamports: amountToDeposit,
      directVote: validatorVoteAccount,
    })

    const transaction = new Transaction().add(...instructions)

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('✓ Transaction prepared')
    console.log('  Your stake will be directed to the specified validator')
    console.log('  You will still receive liquid pool tokens')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Deposit an existing stake account into the pool
 *
 * Convert your existing delegated stake account into liquid pool tokens.
 */
async function depositStakeExample() {
  console.log('\n=== Deposit Stake Account Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')
  const stakeAccountAddress = new PublicKey('YOUR_STAKE_ACCOUNT_HERE')
  const validatorVoteAccount = new PublicKey('VALIDATOR_VOTE_ACCOUNT_HERE')

  console.log('Stake account:', stakeAccountAddress.toBase58())

  try {
    // Verify stake account exists
    const stakeAccountInfo = await connection.getAccountInfo(stakeAccountAddress)
    if (!stakeAccountInfo) {
      throw new Error('Stake account not found')
    }

    console.log('Stake balance:', stakeAccountInfo.lamports / LAMPORTS_PER_SOL, 'SOL')

    const { instructions, signers } = await client.depositStake({
      authority: userPublicKey,
      vote: validatorVoteAccount,
      stake: stakeAccountAddress,
    })

    const transaction = new Transaction().add(...instructions)

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('✓ Transaction prepared')
    console.log('  You will receive pool tokens based on current exchange rate')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Calculate expected pool tokens for a deposit
 *
 * Use this to preview how many pool tokens you'll receive before depositing.
 */
async function calculateExpectedPoolTokens() {
  console.log('\n=== Calculate Expected Pool Tokens ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  try {
    // Get current pool state
    const poolInfo = await client.poolInfo()
    const rate = client.poolTokenRate(poolInfo)

    console.log('Pool Statistics:')
    console.log('  Total staked:', Number(poolInfo.totalLamports) / LAMPORTS_PER_SOL, 'SOL')
    console.log('  Pool token supply:', Number(poolInfo.poolTokenSupply).toLocaleString())
    console.log('  Exchange rate:', rate.toFixed(4), 'lamports per pool token')
    console.log('  Deposit fee:', (poolInfo.solDepositFee * 100).toFixed(3), '%')

    // Calculate for sample amounts
    const amounts = [1, 10, 100]

    console.log('\nExpected Pool Tokens:')
    for (const sol of amounts) {
      const lamports = sol * LAMPORTS_PER_SOL
      const fee = lamports * poolInfo.solDepositFee
      const netLamports = lamports - fee
      const poolTokens = netLamports / rate

      console.log(`  ${sol} SOL → ${poolTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} pool tokens`)
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Run examples
async function main() {
  console.log('JPool SDK - Deposit Examples')
  console.log('============================')

  try {
    await calculateExpectedPoolTokens()

    // Uncomment to run transaction examples:
    // await depositSolExample()
    // await depositSolWithDirectStakeExample()
    // await depositStakeExample()

    console.log('\n✓ Examples completed successfully')
  } catch (error) {
    console.error('\n✗ Error:', error)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  void main()
}

export {
  calculateExpectedPoolTokens,
  depositSolExample,
  depositSolWithDirectStakeExample,
  depositStakeExample,
}
