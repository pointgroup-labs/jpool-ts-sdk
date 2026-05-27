import type {
  DirectStakesQuery,
  StakePoolInfo,
  WalletBindingsQuery,
} from './types'
import {
  depositSol,
  depositStake,
  getStakePoolAccount,
  STAKE_POOL_PROGRAM_ID,
  withdrawSol,
  withdrawStake,
} from '@jpool/spl-stake-pool'
import { createMemoInstruction } from '@solana/spl-memo'
import { Connection, PublicKey } from '@solana/web3.js'
import { version } from '../package.json'
import {
  DIRECT_API_BASE_URL,
  MEMO_DELIMITER,
  MEMO_PREFIX_DIRECT_STAKE,
  MEMO_PREFIX_DIRECT_UNSTAKE,
  MEMO_PREFIX_REFERRAL,
  POOL_ADDRESS,
} from './constants'
import { createApiClient, formatStakePool } from './utils'

export * from './constants'
export * from './types'

/**
 * Configuration options for the JPool client.
 *
 * These options control the behavior of the JPool client, including which
 * stake pool to interact with and optional features like referral tracking.
 */
export type JPoolClientOptions = {
  /**
   * The Solana program ID for the stake pool program.
   * Defaults to the standard SPL Stake Pool program ID.
   */
  programId: PublicKey

  /**
   * The public key address of the stake pool to interact with.
   * Defaults to the JPool stake pool address.
   */
  poolAddress: PublicKey

  /**
   * Enable debug logging for development and troubleshooting.
   * @defaultValue false
   */
  debug?: boolean

  /**
   * Optional referral code to track stake pool operations.
   * When provided, this code will be included in transaction memos
   * for attribution and analytics purposes.
   */
  refCode?: string
} & Record<string, any>

/**
 * JPool SDK client for interacting with Solana stake pools.
 */
export class JPoolClient {
  static version = version

  /**
   * Configuration options for this client instance
   */
  readonly options: JPoolClientOptions

  /**
   * Creates a new JPool client instance.
   *
   * @param connection - Solana RPC connection to use for all operations
   * @param options - Optional configuration overrides
   */
  constructor(
    readonly connection: Connection,
    options?: JPoolClientOptions,
  ) {
    this.options = {
      programId: STAKE_POOL_PROGRAM_ID,
      poolAddress: POOL_ADDRESS,
      ...options,
    }
  }

  /**
   * Updates a specific configuration option.
   *
   * @param key - The option key to update
   * @param val - The new value for the option
   * @returns This client instance for method chaining
   */
  configure<K extends keyof JPoolClientOptions>(key: K, val: JPoolClientOptions[K]) {
    this.options[key] = val
    return this
  }

  /**
   * Gets the stake pool program ID.
   *
   * @returns The public key of the stake pool program
   */
  get programId() {
    return this.options.programId
  }

  /**
   * Gets the stake pool address.
   *
   * @returns The public key of the stake pool account
   */
  get poolAddress() {
    return this.options.poolAddress
  }

  /**
   * Creates an API client for direct stake operations.
   * @private
   */
  private get directClient() {
    return createApiClient(DIRECT_API_BASE_URL)
  }

  /**
   * Fetches the current state and information about the stake pool.
   *
   * @returns The raw stake pool account data
   * @throws {Error} If the stake pool account cannot be fetched
   */
  async poolInfo(): Promise<StakePoolInfo> {
    const { account } = await getStakePoolAccount(this.connection, this.poolAddress)
    return formatStakePool(account.data)
  }

  /**
   * Fetches the current reserve balance.
   */
  async reserveBalance(stakePool: StakePoolInfo) {
    const stake = await this.connection.getAccountInfo(stakePool.reserveStake)
    return stake?.lamports
  }

  /**
   * Calculates the current exchange rate between pool tokens and lamports.
   *
   * The rate represents how many lamports you receive per pool token when withdrawing.
   * A rate > 1 indicates the pool has earned staking rewards.
   * Returns 1 if the pool is empty (poolTokenSupply is 0).
   *
   * @param stakePool - The stake pool state to calculate the rate for
   * @returns The rate as lamports per pool token
   */
  poolTokenRate(stakePool: StakePoolInfo) {
    const totalLamports = Number(stakePool.totalLamports)
    const poolTokens = Number(stakePool.poolTokenSupply)
    if (poolTokens === 0) {
      return 1.0
    }
    return totalLamports / poolTokens
  }

  /**
   * Creates instructions and signers for depositing SOL into the stake pool.
   *
   * This method returns the raw instructions and ephemeral signers needed for the deposit.
   * The caller is responsible for creating a transaction, adding instructions, setting blockhash,
   * and signing with both the ephemeral signers and the user's wallet.
   *
   * @param props - Configuration for the SOL deposit operation
   * @returns Instructions and ephemeral signers for the deposit transaction
   *
   * @remarks
   * The returned signers are ephemeral keypairs created by the SPL library for temporary
   * transfer operations. These must sign the transaction along with the user's wallet.
   */
  async depositSol(props: DepositSolProps) {
    const { instructions, signers } = await depositSol(
      this.connection,
      this.poolAddress,
      props.from,
      props.lamports,
      undefined,
      undefined,
      undefined,
      props.ephemeralAddress,
    )

    const memo = []

    if (this.options.refCode) {
      memo.push(`${MEMO_PREFIX_REFERRAL}${this.options.refCode}`)
    }

    if (props.directVote) {
      memo.push(`${MEMO_PREFIX_DIRECT_STAKE}${props.directVote}`)
    }

    if (memo.length > 0) {
      instructions.push(createMemoInstruction(memo.join(MEMO_DELIMITER)))
    }

    return { instructions, signers }
  }

  /**
   * Creates instructions and signers for depositing a stake account into the pool.
   *
   * This method returns the raw instructions and ephemeral signers needed for depositing
   * an existing stake account. The caller must create a transaction, add instructions,
   * set blockhash, and sign with both the ephemeral signers and the user's wallet.
   *
   * @param props - Configuration for the stake account deposit operation
   * @returns Instructions and ephemeral signers for the stake deposit transaction
   *
   * @remarks
   * The stake account must be already delegated to a validator and in an active state
   * before it can be deposited into the pool.
   */
  async depositStake(props: DepositStakeProps) {
    const { instructions, signers } = await depositStake(
      this.connection,
      this.poolAddress,
      props.authority,
      props.vote,
      props.stake,
    )

    const memo = []

    if (this.options.refCode) {
      memo.push(`${MEMO_PREFIX_REFERRAL}${this.options.refCode}`)
    }

    if (props.directVote) {
      memo.push(`${MEMO_PREFIX_DIRECT_STAKE}${props.directVote}`)
    }

    if (memo.length > 0) {
      instructions.push(createMemoInstruction(memo.join(MEMO_DELIMITER)))
    }

    return { instructions, signers }
  }

  /**
   * Creates instructions and signers for withdrawing SOL from the stake pool.
   *
   * This method burns pool tokens and withdraws liquid SOL from the pool's reserve.
   * Returns the raw instructions and ephemeral signers that must be added to a transaction.
   *
   * @param props - Configuration for the SOL withdrawal operation
   * @returns Instructions and ephemeral signers for the withdrawal transaction
   *
   * @remarks
   * The amount is specified in pool tokens to burn, not the SOL amount to receive.
   * Calculate the expected SOL using: amount * poolTokenRate(poolInfo).
   * Withdrawal fees will be deducted from the final amount.
   */
  async withdrawSol(props: WithdrawSolProps) {
    const { instructions, signers } = await withdrawSol(
      this.connection,
      this.poolAddress,
      props.from,
      props.from,
      props.amount,
      props.withdrawAuthority,
      props.ephemeralTransferAuthority,
    )

    if (props.directId) {
      instructions.push(createMemoInstruction(`${MEMO_PREFIX_DIRECT_UNSTAKE}:${props.directId}`))
    }

    return { instructions, signers }
  }

  /**
   * Creates instructions and signers for withdrawing stake from the pool.
   *
   * This method burns pool tokens and creates a new delegated stake account.
   * The stake account will be delegated to a validator from the pool and will need
   * to go through Solana's activation period before earning rewards.
   *
   * @param props - Configuration for the stake withdrawal operation
   * @returns Instructions and ephemeral signers for the withdrawal transaction
   *
   * @remarks
   * The amount is specified in pool tokens to burn, not the stake lamports to receive.
   * Calculate the expected stake using: amount * poolTokenRate(poolInfo).
   * Stake activation typically takes 1-2 epochs.
   */
  async withdrawStake(props: WithdrawStakeProps) {
    const { instructions, signers } = await withdrawStake(
      this.connection,
      this.poolAddress,
      props.from,
      props.amount,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      props.ephemeralTransferAuthority,
    )

    if (props.directId) {
      instructions.push(createMemoInstruction(`${MEMO_PREFIX_DIRECT_UNSTAKE}:${props.directId}`))
    }

    return { instructions, signers }
  }

  /**
   * Fetches direct stake records for a wallet or validator.
   * At least one of wallet or vote must be provided in the query.
   */
  async getDirectStakes(query: DirectStakesQuery) {
    if (!query.wallet && !query.vote) {
      throw new Error('At least one of wallet or vote must be provided')
    }

    const params: Record<string, string> = {}

    if (query.wallet) {
      params.wallet = query.wallet.toString()
    }

    if (query.vote) {
      params.voteId = query.vote.toString()
    }

    const { data } = await this.directClient.get('find', { params })
    return data
  }

  /**
   * Fetches wallet bindings for a wallet or validator.
   * Exactly one of wallet or vote must be provided in the query.
   */
  async getWalletBindings(query: WalletBindingsQuery) {
    if (!query.wallet && !query.vote) {
      throw new Error('Either wallet or vote must be provided')
    }

    if (query.wallet && query.vote) {
      throw new Error('Only one of wallet or vote should be provided')
    }

    if (query.wallet) {
      const { data } = await this.directClient.get(`wallet-binding/${query.wallet}`)
      return data
    }

    const { data } = await this.directClient.get(`wallet-binding/by-vote/${query.vote}`)
    return data
  }
}

/**
 * Configuration for depositing SOL into the stake pool.
 */
export type DepositSolProps = {
  /**
   * The public key of the account depositing SOL and receiving pool tokens
   */
  from: PublicKey

  /**
   * The amount of SOL to deposit, in lamports
   */
  lamports: number

  /**
   * Optional validator vote address to direct your stake to.
   *
   * When provided, the pool will attempt to delegate your stake to this specific
   * validator. This is useful for supporting specific validators while still
   * benefiting from the pool's liquidity.
   */
  directVote?: PublicKey

  /**
   * Optional ephemeral keypair address for the deposit operation.
   */
  ephemeralAddress?: PublicKey
}

/**
 * Configuration for depositing a stake account into the stake pool.
 */
export type DepositStakeProps = {
  /**
   * The authority (owner) of the stake account being deposited
   */
  authority: PublicKey

  /**
   * The vote account address of the validator that the stake account is delegated to
   */
  vote: PublicKey

  /**
   * The public key of the stake account to deposit
   */
  stake: PublicKey

  /**
   * Optional validator vote address to direct your stake to after deposit.
   *
   * When provided, the pool will track your preference to delegate to this specific
   * validator. This allows you to support a specific validator while maintaining
   * pool token liquidity.
   */
  directVote?: PublicKey
}

/**
 * Configuration for withdrawing SOL from the stake pool.
 */
export type WithdrawSolProps = {
  /**
   * The public key of the account that owns the pool tokens and will receive SOL
   */
  from: PublicKey

  /**
   * The amount of pool tokens to burn (not the SOL amount to receive)
   * To calculate the SOL you'll receive, multiply this by the pool token rate.
   */
  amount: number

  /**
   * Optional custom withdraw authority.
   */
  withdrawAuthority?: PublicKey

  /**
   * Optional ephemeral transfer authority for the withdrawal operation.
   */
  ephemeralTransferAuthority?: PublicKey

  /**
   * Optional identifier for direct unstake operations.
   */
  directId?: PublicKey
}

/**
 * Configuration for withdrawing stake from the stake pool.
 */
export type WithdrawStakeProps = {
  /**
   * The public key of the account that owns the pool tokens
   */
  from: PublicKey

  /**
   * The amount of pool tokens to burn (not the stake lamports to receive)
   * To calculate the stake you'll receive, multiply this by the pool token rate.
   */
  amount: number

  /**
   * Optional ephemeral transfer authority for the withdrawal operation.
   */
  ephemeralTransferAuthority?: PublicKey

  /**
   * Optional identifier for direct unstake operations.
   */
  directId?: PublicKey
}
