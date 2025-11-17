import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { JPoolClient } from '../src'

const wallet = new PublicKey('FsadgRQjGGpnS3NKAxS4Rg6waxbpqfp7bg4yYMH7PNvu')
const vote = new PublicKey('5afRnmkFn1pRU9oussqwk1RRBVyoDgUkL16Jz4qNf574')

const connection = new Connection(clusterApiUrl('mainnet-beta'))

async function main() {
  const client = new JPoolClient(connection)
  console.log('JPoolClient version:', JPoolClient.version)

  // Fetch pool info
  const pool = await client.poolInfo()
  console.log('Pool Info:', pool)

  // Fetch pool token rate
  const jsolRate = client.poolTokenRate(pool)
  console.log('JSOL Rate:', jsolRate)

  // Fetch reserve balance
  const reserveBalance = await client.reserveBalance(pool)
  console.log('Reserve Balance (lamports):', reserveBalance)

  // Fetch direct stakes for a given vote account
  const directStakes = await client.getDirectStakes({ vote })
  console.log('Direct Stakes:', directStakes)

  // Fetch direct wallet bindings
  const directBindings = await client.getWalletBindings({ wallet })
  console.log('Direct wallet bindings:', directBindings)

  // Fetch vote wallet bindings
  const voteWalletBindings = await client.getWalletBindings({ vote })
  console.log('Vote wallet bindings:', voteWalletBindings)
}

void main()
