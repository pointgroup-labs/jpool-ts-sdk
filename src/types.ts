import type { PublicKey } from '@solana/web3.js'

/**
 * Parameters for querying direct stakes.
 */
export interface DirectStakesQuery {
  /**
   * Filter by wallet address
   */
  wallet?: PublicKey

  /**
   * Filter by validator vote account address
   */
  vote?: PublicKey
}

/**
 * Parameters for querying wallet bindings.
 */
export interface WalletBindingsQuery {
  /**
   * Filter by wallet address
   */
  wallet?: PublicKey

  /**
   * Filter by validator vote account address
   */
  vote?: PublicKey
}

/**
 * Stake pool info
 */
export interface StakePoolInfo {
  /**
   * Public key of the pool manager who can modify pool settings
   */
  manager: PublicKey

  /**
   * Public key of the staker who can manage stake accounts
   */
  staker: PublicKey

  /**
   * Authority for stake deposits
   */
  stakeDepositAuthority: PublicKey

  /**
   * Bump seed for the stake withdrawal authority PDA
   */
  stakeWithdrawBumpSeed: number

  /**
   * Public key of the validator list account
   */
  validatorList: PublicKey

  /**
   * Public key of the reserve stake account
   */
  reserveStake: PublicKey

  /**
   * Public key of the pool token mint
   */
  poolMint: PublicKey

  /**
   * Account that receives manager fees
   */
  managerFeeAccount: PublicKey

  /**
   * Token program ID (usually SPL Token program)
   */
  tokenProgramId: PublicKey

  /**
   * Total lamports under pool management (including staked and reserve)
   */
  totalLamports: bigint

  /**
   * Total supply of pool tokens in circulation
   */
  poolTokenSupply: bigint

  /**
   * Epoch when the pool was last updated
   */
  lastUpdateEpoch: bigint

  /**
   * Pool token supply in the previous epoch
   */
  lastEpochPoolTokenSupply: bigint

  /**
   * Total lamports in the previous epoch
   */
  lastEpochTotalLamports: bigint

  /**
   * Unix timestamp (in seconds) when the lockup expires
   */
  lockupUnixTimestamp: bigint

  /**
   * Epoch number when the lockup expires
   */
  lockupEpoch: bigint

  /**
   * Public key of the custodian who can unlock before the lockup expires
   */
  lockupCustodian: PublicKey

  /**
   * Fee charged to the pool each epoch, as a decimal (0.03 = 3%)
   */
  epochFee: number

  /**
   * Next epoch's fee if scheduled for change, as a decimal
   */
  nextEpochFee?: number

  /**
   * Preferred validator vote address for deposits
   */
  preferredDepositValidatorVoteAddress?: PublicKey

  /**
   * Preferred validator vote address for withdrawals
   */
  preferredWithdrawValidatorVoteAddress?: PublicKey

  /**
   * Fee charged on stake deposits, as a decimal (0.03 = 3%)
   */
  stakeDepositFee: number

  /**
   * Fee charged on stake withdrawals, as a decimal
   */
  stakeWithdrawalFee: number

  /**
   * Next epoch's stake withdrawal fee if scheduled for change, as a decimal
   */
  nextStakeWithdrawalFee?: number

  /**
   * Referral fee percentage (0-100) for stake operations
   */
  stakeReferralFee: number

  /**
   * Authority that can perform SOL deposits
   */
  solDepositAuthority?: PublicKey

  /**
   * Fee charged on SOL deposits, as a decimal (0.03 = 3%)
   */
  solDepositFee: number

  /**
   * Referral fee percentage (0-100) for SOL deposits
   */
  solReferralFee: number

  /**
   * Authority that can perform SOL withdrawals
   */
  solWithdrawAuthority?: PublicKey

  /**
   * Fee charged on SOL withdrawals, as a decimal
   */
  solWithdrawalFee: number

  /**
   * Next epoch's SOL withdrawal fee if scheduled for change, as a decimal
   */
  nextSolWithdrawalFee?: number
}
