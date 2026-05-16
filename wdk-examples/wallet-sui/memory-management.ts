/**
 * Sui Example: Memory Management
 *
 * Demonstrates: Securely disposing of account instances and the
 * wallet manager to clear private keys from memory.
 *
 * Run: npx tsx wallet-sui/memory-management.ts
 */

import WalletManagerSui from '@tetherto/wdk-wallet-sui'
import { loadSuiConfig } from '../shared/config.js'
import { logSection, logResult } from '../shared/helpers.js'

async function main() {
  const config = loadSuiConfig()

  logSection('Memory Management (Sui)')

  const wallet = new WalletManagerSui(config.seedPhrase, {
    rpcUrl: config.rpcUrl
  })

  // Derive an account
  const account = await wallet.getAccount(0)
  logResult('Initial KeyPair Status', {
    hasPrivateKey: account.keyPair.privateKey !== undefined
  })

  // 1. Dispose specific account
  console.log('\nDisposing account...')
  account.dispose()
  logResult('Post-Account Disposal Status', {
    hasPrivateKey: account.keyPair.privateKey !== undefined
  })

  try {
    await account.sign('test')
  } catch (err) {
    console.log('  Expected error after disposal:', (err as Error).message)
  }

  // 2. Dispose wallet manager (clears all remaining keys)
  console.log('\nDisposing wallet manager...')
  wallet.dispose()

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
