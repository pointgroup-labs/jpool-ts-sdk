import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js'
import { JPoolClient } from '../src'

/**
 * Example: Withdraw SOL from the stake pool
 *
 * Burn pool tokens and receive native SOL based on the current exchange rate.
 */
async function withdrawSolExample() {
  console.log('\n=== Withdraw SOL Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  // Replace with your wallet's public key
  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')

  // Amount of pool tokens to burn
  const poolTokensToBurn = 1000000

  console.log('Pool tokens to burn:', poolTokensToBurn)

  try {
    // Calculate expected SOL
    const poolInfo = await client.poolInfo()
    const rate = client.poolTokenRate(poolInfo)
    const expectedLamports = poolTokensToBurn * rate
    const withdrawalFee = expectedLamports * poolInfo.solWithdrawalFee
    const netLamports = expectedLamports - withdrawalFee

    console.log('\nExpected withdrawal:')
    console.log('  Gross:', (expectedLamports / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
    console.log('  Fee:', (poolInfo.solWithdrawalFee * 100).toFixed(3), '%')
    console.log('  Net:', (netLamports / LAMPORTS_PER_SOL).toFixed(4), 'SOL')

    // Get withdrawal instructions and signers
    const { instructions, signers } = await client.withdrawSol({
      from: userPublicKey,
      amount: poolTokensToBurn,
    })

    // Create transaction and add instructions
    const transaction = new Transaction().add(...instructions)

    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('\n✓ Transaction prepared')
    console.log('  Instructions:', instructions.length)
    console.log('  Ephemeral signers:', signers.length)

    // Sign and send the transaction:
    // 1. transaction.sign(...signers) // Sign with ephemeral signers
    // 2. Sign with your wallet (e.g., Phantom, Solflare)
    // 3. const signature = await connection.sendRawTransaction(transaction.serialize())
    // 4. await connection.confirmTransaction(signature)
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Withdraw stake account from the pool
 *
 * Burn pool tokens and receive a delegated stake account instead of liquid SOL.
 */
async function withdrawStakeExample() {
  console.log('\n=== Withdraw Stake Account Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  // Replace with your wallet's public key
  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')
  const poolTokensToBurn = 5000000

  console.log('Pool tokens to burn:', poolTokensToBurn)

  try {
    // Calculate expected stake value
    const poolInfo = await client.poolInfo()
    const rate = client.poolTokenRate(poolInfo)
    const expectedLamports = poolTokensToBurn * rate
    const withdrawalFee = expectedLamports * poolInfo.stakeWithdrawalFee
    const netLamports = expectedLamports - withdrawalFee

    console.log('\nExpected stake value:')
    console.log('  Gross:', (expectedLamports / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
    console.log('  Fee:', (poolInfo.stakeWithdrawalFee * 100).toFixed(3), '%')
    console.log('  Net:', (netLamports / LAMPORTS_PER_SOL).toFixed(4), 'SOL')

    // Get withdrawal instructions and signers
    const { instructions, signers } = await client.withdrawStake({
      from: userPublicKey,
      amount: poolTokensToBurn,
    })

    // Create transaction and add instructions
    const transaction = new Transaction().add(...instructions)

    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('\n✓ Transaction prepared')
    console.log('  A new delegated stake account will be created')
    console.log('  Activation takes 1-2 epochs before earning rewards')
    console.log('  Ephemeral signers:', signers.length)

    // Sign and send the transaction:
    // 1. transaction.sign(...signers) // Sign with ephemeral signers
    // 2. Sign with your wallet (e.g., Phantom, Solflare)
    // 3. const signature = await connection.sendRawTransaction(transaction.serialize())
    // 4. await connection.confirmTransaction(signature)
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Withdraw from direct stake
 *
 * Withdraw SOL that was previously directed to a specific validator.
 */
async function withdrawDirectStakeExample() {
  console.log('\n=== Withdraw Direct Stake Example ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  // Replace with your wallet's public key and direct stake ID
  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')
  const directStakeId = new PublicKey('VALIDATOR_VOTE_ACCOUNT_HERE')
  const poolTokensToBurn = 2000000

  console.log('Direct stake ID:', directStakeId.toBase58())
  console.log('Pool tokens to burn:', poolTokensToBurn)

  try {
    // Get withdrawal instructions with direct stake ID
    const { instructions, signers } = await client.withdrawSol({
      from: userPublicKey,
      amount: poolTokensToBurn,
      directId: directStakeId,
    })

    // Create transaction and add instructions
    const transaction = new Transaction().add(...instructions)

    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = userPublicKey

    console.log('\n✓ Transaction prepared')
    console.log('  Unstaking from your specified validator')
    console.log('  Memo attached for tracking')
    console.log('  Ephemeral signers:', signers.length)

    // Sign and send the transaction:
    // 1. transaction.sign(...signers) // Sign with ephemeral signers
    // 2. Sign with your wallet (e.g., Phantom, Solflare)
    // 3. const signature = await connection.sendRawTransaction(transaction.serialize())
    // 4. await connection.confirmTransaction(signature)
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Calculate withdrawal amounts
 *
 * Calculate the exact amount of SOL or stake you'll receive for pool tokens.
 */
async function calculateWithdrawalAmount() {
  console.log('\n=== Calculate Withdrawal Amount ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  try {
    const poolInfo = await client.poolInfo()
    const rate = client.poolTokenRate(poolInfo)

    console.log('Pool Statistics:')
    console.log('  Exchange rate:', rate.toFixed(4), 'lamports per pool token')
    console.log('  SOL withdrawal fee:', (poolInfo.solWithdrawalFee * 100).toFixed(3), '%')
    console.log('  Stake withdrawal fee:', (poolInfo.stakeWithdrawalFee * 100).toFixed(3), '%')

    // Calculate for sample amounts
    const amounts = [1000000, 5000000, 10000000]

    console.log('\nWithdrawal Calculations:')
    for (const poolTokens of amounts) {
      const grossLamports = poolTokens * rate
      const solFee = grossLamports * poolInfo.solWithdrawalFee
      const stakeFee = grossLamports * poolInfo.stakeWithdrawalFee

      const netSol = grossLamports - solFee
      const netStake = grossLamports - stakeFee

      console.log(`  ${poolTokens.toLocaleString()} tokens →`)
      console.log(`    Withdraw SOL: ${(netSol / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
      console.log(`    Withdraw Stake: ${(netStake / LAMPORTS_PER_SOL).toFixed(4)} SOL value`)
    }
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}

/**
 * Example: Check pool token balance
 *
 * Check your current pool token balance before withdrawal.
 */
async function checkPoolTokenBalance() {
  console.log('\n=== Check Pool Token Balance ===\n')

  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  const client = new JPoolClient(connection)

  // Replace with your wallet's public key
  const userPublicKey = new PublicKey('YOUR_WALLET_ADDRESS_HERE')

  try {
    const poolInfo = await client.poolInfo()
    const poolMint = poolInfo.poolMint

    console.log('Pool token mint:', poolMint.toBase58())

    // Get token accounts for the user
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      { mint: poolMint },
    )

    if (tokenAccounts.value.length === 0) {
      console.log('\n✗ No pool token account found')
      console.log('  Deposit SOL first to receive pool tokens')
      return
    }

    const poolTokenAccount = tokenAccounts.value[0]
    const balance = poolTokenAccount.account.data.parsed.info.tokenAmount.uiAmount

    console.log('\n✓ Pool token balance:', balance.toLocaleString())
    console.log('  Token account:', poolTokenAccount.pubkey.toBase58())

    // Calculate equivalent SOL value
    const rate = client.poolTokenRate(poolInfo)
    const lamportsValue = balance * rate
    const solValue = lamportsValue / LAMPORTS_PER_SOL

    console.log('\nEstimated value:')
    console.log('  ~', solValue.toFixed(4), 'SOL (before withdrawal fees)')
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Run examples
async function main() {
  console.log('JPool SDK - Withdrawal Examples')
  console.log('================================')

  try {
    await calculateWithdrawalAmount()

    // Uncomment to run specific examples:
    // await checkPoolTokenBalance()
    // await withdrawSolExample()
    // await withdrawStakeExample()
    // await withdrawDirectStakeExample()

    console.log('\n✓ Examples completed successfully')
  } catch (error) {
    console.error('\n✗ Error running examples:', error)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  void main()
}

export {
  calculateWithdrawalAmount,
  checkPoolTokenBalance,
  withdrawDirectStakeExample,
  withdrawSolExample,
  withdrawStakeExample,
}
