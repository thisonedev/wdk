import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import CowswapProtocolEvm from '@tetherto/wdk-protocol-swap-cowswap-evm'
import { loadEvmConfig } from '../shared/config.js'
import { logSection } from '../shared/helpers.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Example demonstrating how to cancel a CowSwap limit order.
 */
async function main () {
  logSection('Initializing Cancel Order Operation')
  await sleep(1000)
  
  // 1. Setup account and protocol
  const { seedPhrase, rpcUrl } = loadEvmConfig()
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: rpcUrl
  })

  const protocol = new CowswapProtocolEvm(account)
  const address = await account.getAddress()

  console.log('Using account:', address)

  // 2. Create a limit order first so we have something to cancel
  logSection('Creating a limit order to cancel (optional)')
  await sleep(1000)
  const WETH_TOKEN = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
  const USDT_TOKEN = '0x58Eb19eF91e8A6327FEd391b51aE1887b833cc91'

  try {
    // Get USDT balance to sell all
    const usdtBalance = await account.getTokenBalance(USDT_TOKEN)
    
    if (usdtBalance > 0n) {
      console.log(`Selling ${usdtBalance} USDT...`)
      
      const order = await protocol.createLimitOrder({
        tokenIn: USDT_TOKEN,
        tokenOut: WETH_TOKEN,
        sellAmount: usdtBalance,
        buyAmount: 1n, // WARNING: Placeholder. Set a realistic buyAmount based on desired price.
        validTo: Math.floor(Date.now() / 1000) + 3600
      })
      console.log('Order created! UID:', order.hash)
    } else {
      console.log('No USDT balance to sell, skipping order creation.')
    }
  } catch (error: any) {
    console.warn('Could not create order (skipping):', error.message)
  }

  // 3. Cleanup: Cancel all open orders for this user
  logSection('Cleaning up all open orders')
  console.log('Action: Waiting 15s for orders to be indexed...')
  await sleep(15000)
  
  const cowApi = await protocol._getCowApi()
  
  try {
    const allOrders = await cowApi.getOrders({ owner: address })
    const openOrders = allOrders.filter((o: any) => o.status === 'open')
    
    if (openOrders.length > 0) {
      console.log(`Found ${openOrders.length} open order(s). Cancelling...`)
      const uids = openOrders.map((o: any) => o.uid)
      await protocol.cancelOrder(uids)
      console.log('All open orders cancelled successfully!')
    } else {
      console.log('No open orders found to cancel.')
    }
  } catch (error: any) {
    console.error('Failed to cleanup orders:', error.message)
  }
}

main().catch(console.error)
