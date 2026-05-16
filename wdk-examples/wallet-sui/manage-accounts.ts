/**
 * Sui Example: Manage Accounts
 *
 * Demonstrates: Deriving multiple accounts using sequential indices
 * and custom derivation paths.
 *
 * Run: npx tsx wallet-sui/manage-accounts.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Manage Sui Accounts')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  // 1. Get accounts by index (m/44'/784'/i'/0'/0')
  console.log('\nDeriving accounts by index:')
  for (let i = 0; i < 3; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    logResult(`Account ${i}`, { address, path: account.path })
  }

  // 2. Get account by custom derivation path relative to Sui prefix
  console.log('\nDeriving account by custom path:')
  const customPath = "0'/0'/1'"
  const customAccount = await wallet.getAccountByPath(customPath)
  const customAddress = await customAccount.getAddress()
  logResult(`Custom Path Account`, {
    address: customAddress,
    path: customAccount.path
  })

  wallet.dispose()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
