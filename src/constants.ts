import { PublicKey } from '@solana/web3.js'

/**
 * The public key address of the JPool stake pool.
 */
export const POOL_ADDRESS = new PublicKey('CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1')

/**
 * The public key address of the JPool pool token mint.
 */
export const POOL_MINT_ADDRESS = new PublicKey('7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn')

export const MEMO_DELIMITER = '&'
export const MEMO_PREFIX_REFERRAL = 'ref:'
export const MEMO_PREFIX_DIRECT_STAKE = 'direct:'
export const MEMO_PREFIX_DIRECT_UNSTAKE = 'direct-unstake:'

export const DOMAIN = 'jpool.one'
export const API_BASE_URL = `https://api.${DOMAIN}`
export const API2_BASE_URL = `https://api2.${DOMAIN}`
export const DIRECT_API_BASE_URL = `${API2_BASE_URL}/direct-stake`
