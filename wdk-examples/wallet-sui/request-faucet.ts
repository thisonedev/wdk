/**
 * Sui Example: Request Faucet
 *
 * Demonstrates: Initializing a WalletManagerSui, deriving an account,
 * and requesting SUI tokens from the faucet (Devnet/Testnet).
 *
 * Run: npm run example:wallet-sui:request-faucet
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult, formatMist } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection(`Request Sui Faucet`)

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  const account = await wallet.getAccount(0)
  const address = await account.getAddress()

  const initialBalance = await account.getBalance()
  logResult('Current Wallet State', {
    address,
    balance: formatMist(initialBalance)
  })

  console.log(`\nRequesting SUI from faucet...`)
  
  try {
    // Faucet is only available on testnet or devnet
    await wallet.requestFaucet(0, 'testnet')
    console.log('Faucet request submitted successfully!')
  } catch (err: any) {
    console.error('Faucet request failed:', err.message)
    process.exit(1)
  }

  // Wait a bit for the transaction to be processed and indexer to update
  console.log('Waiting 5 seconds for balance to update...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  const newBalance = await account.getBalance()
  logResult('Updated Wallet State', {
    address,
    balance: formatMist(newBalance),
    received: formatMist(newBalance - initialBalance)
  })

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
