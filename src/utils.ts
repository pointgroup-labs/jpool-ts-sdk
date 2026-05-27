import type { Axios } from 'axios'
import { StakePool } from '@jpool/spl-stake-pool'
import axios from 'axios'
import { JPoolClient, StakePoolInfo } from './index'

/**
 * Creates a configured Axios HTTP client for making API requests.
 */
export function createApiClient(baseURL: string): Axios {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    config.params = { ...config.params, client: `jpool-client-${JPoolClient.version}` }
    return config
  })

  return client
}

/**
 * Converts a fee structure with numerator/denominator to a decimal percentage.
 *
 * @param numerator - The fee numerator
 * @param denominator - The fee denominator
 * @returns The fee as a decimal number (0.03 for 3%)
 */
function feeToPercentage(numerator: bigint, denominator: bigint): number {
  if (denominator === 0n) {
    return 0
  }
  return Number(numerator) / Number(denominator)
}

/**
 * Converts a raw StakePool from spl-stake-pool into an enhanced StakePoolInfo format.
 *
 * @param rawPool - The raw stake pool data from @jpool/spl-stake-pool
 * @returns A more developer-friendly formatted stake pool object
 *
 * @remarks
 * This function converts BN values to native bigint, fees from numerator/denominator
 * to decimal percentages, and flattens the structure for easier access.
 */
export function formatStakePool(rawPool: StakePool): StakePoolInfo {
  return {
    manager: rawPool.manager,
    staker: rawPool.staker,
    stakeDepositAuthority: rawPool.stakeDepositAuthority,
    stakeWithdrawBumpSeed: rawPool.stakeWithdrawBumpSeed,
    validatorList: rawPool.validatorList,
    reserveStake: rawPool.reserveStake,
    poolMint: rawPool.poolMint,
    managerFeeAccount: rawPool.managerFeeAccount,
    tokenProgramId: rawPool.tokenProgramId,

    totalLamports: BigInt(rawPool.totalLamports.toString()),
    poolTokenSupply: BigInt(rawPool.poolTokenSupply.toString()),
    lastUpdateEpoch: BigInt(rawPool.lastUpdateEpoch.toString()),
    lastEpochPoolTokenSupply: BigInt(rawPool.lastEpochPoolTokenSupply.toString()),
    lastEpochTotalLamports: BigInt(rawPool.lastEpochTotalLamports.toString()),

    lockupUnixTimestamp: BigInt(rawPool.lockup.unixTimestamp.toString()),
    lockupEpoch: BigInt(rawPool.lockup.epoch.toString()),
    lockupCustodian: rawPool.lockup.custodian,

    epochFee: feeToPercentage(
      BigInt(rawPool.epochFee.numerator.toString()),
      BigInt(rawPool.epochFee.denominator.toString()),
    ),

    nextEpochFee: rawPool.nextEpochFee
      ? feeToPercentage(
          BigInt(rawPool.nextEpochFee.numerator.toString()),
          BigInt(rawPool.nextEpochFee.denominator.toString()),
        )
      : undefined,

    preferredDepositValidatorVoteAddress: rawPool.preferredDepositValidatorVoteAddress,
    preferredWithdrawValidatorVoteAddress: rawPool.preferredWithdrawValidatorVoteAddress,

    stakeDepositFee: feeToPercentage(
      BigInt(rawPool.stakeDepositFee.numerator.toString()),
      BigInt(rawPool.stakeDepositFee.denominator.toString()),
    ),

    stakeWithdrawalFee: feeToPercentage(
      BigInt(rawPool.stakeWithdrawalFee.numerator.toString()),
      BigInt(rawPool.stakeWithdrawalFee.denominator.toString()),
    ),

    nextStakeWithdrawalFee: rawPool.nextStakeWithdrawalFee
      ? feeToPercentage(
          BigInt(rawPool.nextStakeWithdrawalFee.numerator.toString()),
          BigInt(rawPool.nextStakeWithdrawalFee.denominator.toString()),
        )
      : undefined,

    stakeReferralFee: rawPool.stakeReferralFee,

    solDepositAuthority: rawPool.solDepositAuthority,

    solDepositFee: feeToPercentage(
      BigInt(rawPool.solDepositFee.numerator.toString()),
      BigInt(rawPool.solDepositFee.denominator.toString()),
    ),

    solReferralFee: rawPool.solReferralFee,

    solWithdrawAuthority: rawPool.solWithdrawAuthority,

    solWithdrawalFee: feeToPercentage(
      BigInt(rawPool.solWithdrawalFee.numerator.toString()),
      BigInt(rawPool.solWithdrawalFee.denominator.toString()),
    ),

    nextSolWithdrawalFee: rawPool.nextSolWithdrawalFee
      ? feeToPercentage(
          BigInt(rawPool.nextSolWithdrawalFee.numerator.toString()),
          BigInt(rawPool.nextSolWithdrawalFee.denominator.toString()),
        )
      : undefined,
  }
}
