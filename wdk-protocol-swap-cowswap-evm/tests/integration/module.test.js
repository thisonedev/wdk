// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import brittle from 'brittle'
import { ethers } from 'ethers'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import CowswapProtocolEvm from '../../src/cowswap-protocol-evm.js'

const test = brittle

const SEED_PHRASE = 'emerge arctic potato consider female artist corn put fury prefer infant body'
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com'

const WETH_TOKEN = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const USDT_TOKEN = '0x58Eb19eF91e8A6327FEd391b51aE1887b833cc91'

test('@tetherto/wdk-protocol-swap-cowswap-evm', async (t) => {
  t.timeout(900000)
  const account = new WalletAccountEvm(SEED_PHRASE, "0'/0/0", {
    provider: RPC_URL
  })

  const protocol = new CowswapProtocolEvm(account)
  const address = await account.getAddress()
  
  const erc20Abi = ['function balanceOf(address) view returns (uint256)']
  const usdt = new ethers.Contract(USDT_TOKEN, erc20Abi, account._provider)
  
  const ethBal = await account._provider.getBalance(address)
  const usdtBal = await usdt.balanceOf(address)
  
  const formatEth = (val) => Number(ethers.formatEther(val)).toFixed(6)
  const formatUsdt = (val) => Number(ethers.formatUnits(val, 6)).toFixed(2)

  t.comment(`Balance: ${formatEth(ethBal)} ETH, ${formatUsdt(usdtBal)} USDT`)
  
  let tokenIn, tokenOut, amount, label
  if (usdtBal > 0n) { // Swap all USDT back
    tokenIn = USDT_TOKEN
    tokenOut = WETH_TOKEN
    amount = usdtBal
    label = `USDT -> WETH (Amount: ${formatUsdt(usdtBal)})`
    t.comment(`Action: Swapping ALL ${formatUsdt(usdtBal)} USDT back to WETH`)
  } else if (ethBal > 2000000000000000n) { // > 0.002 ETH
    tokenIn = WETH_TOKEN
    tokenOut = USDT_TOKEN
    amount = 1000000000000000n // 0.001 ETH
    label = `ETH -> WETH -> USDT (Amount: ${formatEth(amount)} ETH)`
    t.comment(`Action: Swapping ${formatEth(amount)} ETH to USDT`)
  } else {
    t.fail('No USDT or ETH balance detected')
  }

  await t.test('should successfully quote a swap', async (t) => {
    const quote = await protocol.quoteSwap({
      tokenIn,
      tokenOut,
      tokenInAmount: amount
    })
    const outLabel = tokenOut === USDT_TOKEN ? `${formatUsdt(quote.tokenOutAmount)} USDT` : `${formatEth(quote.tokenOutAmount)} WETH`
    t.comment(`Quote: Selling ${label.split(' (')[0]} for ~${outLabel}`)
    t.ok(quote.tokenOutAmount > 0n, 'Should receive tokens out')
  })

  await t.test(`should successfully perform swap: ${label}`, async (t) => {
    t.timeout(720000)
    // 1. Wrap ETH to WETH if tokenIn is WETH
    if (tokenIn === WETH_TOKEN) {
      t.comment(`Step 1: Wrapping ${formatEth(amount)} ETH to WETH...`)
      const wallet = ethers.Wallet.fromPhrase(SEED_PHRASE).connect(account._provider)
      const wethContract = new ethers.Contract(WETH_TOKEN, ['function deposit() payable'], wallet)
      const tx = await wethContract.deposit({ value: amount })
      await tx.wait()
      t.ok(tx.hash, 'ETH wrapped successfully')
    }

    // 2. Approve Vault Relayer
    t.comment('Step 2: Checking Relayer allowance...')
    const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' // Production address
    const wallet = ethers.Wallet.fromPhrase(SEED_PHRASE).connect(account._provider)
    const tokenContract = new ethers.Contract(tokenIn, [
      'function approve(address,uint256) returns (bool)',
      'function allowance(address,address) view returns (uint256)'
    ], wallet)
    
    const allowance = await tokenContract.allowance(address, VAULT_RELAYER)
    if (allowance < amount) {
      t.comment(`Step 2b: Approving Vault Relayer (Current: ${tokenIn === USDT_TOKEN ? formatUsdt(allowance) : formatEth(allowance)})...`)
      const approveTx = await tokenContract.approve(VAULT_RELAYER, ethers.MaxUint256)
      await approveTx.wait()
      t.ok(approveTx.hash, 'Vault Relayer approved')
    } else {
      t.comment('Step 2b: Allowance sufficient')
    }
    
    t.comment('Step 3: Executing swap on Cowswap...')
    const result = await protocol.swap({
      tokenIn,
      tokenOut,
      tokenInAmount: amount
    })
    t.ok(result.hash, 'Swap fulfilled!')
  })

  let limitOrderUid
  await t.test('should successfully create a limit order', async (t) => {
    const wethContract = new ethers.Contract(WETH_TOKEN, ['function balanceOf(address) view returns (uint256)'], account._provider)
    const wethBal = await wethContract.balanceOf(address)
    t.comment(`Balance: ${formatEth(wethBal)} WETH, ${formatUsdt(usdtBal)} USDT`)
    t.comment('Action: Creating a limit order (0.0001 ETH for 100 USDT)')

    const result = await protocol.createLimitOrder({
      tokenIn: WETH_TOKEN,
      tokenOut: USDT_TOKEN,
      sellAmount: 100000000000000n, // 0.0001 ETH
      buyAmount: 100000000n, // 100 USDT
      validTo: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    })

    t.ok(result.hash, `Limit order created! UID: ${result.hash}`)
    limitOrderUid = result.hash
    t.comment(`Explorer: https://explorer.cow.fi/sepolia/orders/${result.hash}`)
  })

  await t.test('should successfully cancel the limit order', async (t) => {
    t.comment(`Action: Cancelling limit order ${limitOrderUid}...`)
    await protocol.cancelOrder(limitOrderUid)
    t.pass('Limit order cancelled successfully')
  })
})
