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

import { SwapProtocol } from '@tetherto/wdk-wallet/protocols'
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

import { keccak256, toUtf8Bytes } from 'ethers'

import { OrderBookApi, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'

/** @typedef {import('@tetherto/wdk-wallet/protocols').SwapProtocolConfig} SwapProtocolConfig */
/** @typedef {import('@tetherto/wdk-wallet/protocols').SwapOptions} SwapOptions */

/**
 * @typedef {SwapOptions} CowswapSwapOptions
 */

/**
 * @typedef {Object} CowswapLimitOrderOptions
 * @property {string} tokenIn - The input token address.
 * @property {string} tokenOut - The output token address.
 * @property {number|string|bigint} sellAmount - The amount to sell.
 * @property {number|string|bigint} buyAmount - The amount to buy.
 * @property {number} [validTo] - The expiration time in seconds (unix timestamp).
 */

/**
 * @typedef {Object} CowswapTwapOrderOptions
 * @property {string} tokenIn - The input token address.
 * @property {string} tokenOut - The output token address.
 * @property {number|string|bigint} amount - The total amount to sell.
 * @property {number} numParts - The number of parts to split the order into.
 * @property {number} duration - The total duration of the TWAP order in seconds.
 * @property {number} [priceProtection] - Price protection percentage (0-100).
 */

export default class CowswapProtocolEvm extends SwapProtocol {
  /**
   * Creates a new read-only interface to the Cowswap protocol for evm blockchains.
   *
   * @overload
   * @param {WalletAccountEvm | WalletAccountEvmErc4337} account - The account to use for the protocol.
   */
  constructor (account) {
    super(account)

    this._account = account
    this._provider = account._provider
    /** @type {OrderBookApi} */
    this._cowApi = null
  }

  /**
   * Performs a swap operation.
   *
   * @param {CowswapSwapOptions} options - The swap's options.
   * @returns {Promise<import('@tetherto/wdk-wallet/protocols').SwapResult>} The swap's result.
   */
  async swap ({ tokenIn, tokenOut, tokenInAmount, tokenOutAmount, to, validTo }) {
    if (typeof this._account.signTypedData !== 'function') {
      throw new Error("The 'swap(options)' method requires the protocol to be initialized with a non read-only account.")
    }

    const { order, appDataDoc } = await this._getSwapOrder({
      tokenIn,
      tokenOut,
      tokenInAmount,
      tokenOutAmount,
      to,
      validTo
    })

    return await this._signAndSendOrder(order, appDataDoc)
  }

  /**
   * Returns a quote for a swap operation.
   *
   * @param {SwapOptions} options - The swap's options.
   * @returns {Promise<import('@tetherto/wdk-wallet/protocols').SwapQuote>} The swap's quote.
   */
  async quoteSwap ({ tokenIn, tokenOut, tokenInAmount, tokenOutAmount, to }) {
    const { quote } = await this._getSwapOrder({ tokenIn, tokenOut, tokenInAmount, tokenOutAmount, to })

    return {
      fee: BigInt(quote.feeAmount),
      tokenInAmount: BigInt(quote.sellAmount),
      tokenOutAmount: BigInt(quote.buyAmount)
    }
  }

  /**
   * Creates a limit order.
   *
   * @param {CowswapLimitOrderOptions} options - The limit order options.
   * @returns {Promise<import('@tetherto/wdk-wallet/protocols').SwapResult>} The result of the limit order creation.
   */
  async createLimitOrder ({ tokenIn, tokenOut, sellAmount, buyAmount, validTo }) {
    if (typeof this._account.signTypedData !== 'function') {
      throw new Error("The 'createLimitOrder(options)' method requires the protocol to be initialized with a non read-only account.")
    }

    const { appDataHash, appDataDoc } = this._getAppData()

    const order = {
      sellToken: tokenIn,
      buyToken: tokenOut,
      receiver: await this._account.getAddress(),
      sellAmount: sellAmount.toString(),
      buyAmount: buyAmount.toString(),
      validTo: validTo || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
      appData: appDataHash,
      feeAmount: '0',
      kind: OrderKind.SELL,
      partiallyFillable: false,
      sellTokenBalance: 'erc20',
      buyTokenBalance: 'erc20'
    }

    return await this._signAndSendOrder(order, appDataDoc)
  }

  /**
   * Cancels one or more orders off-chain.
   *
   * @param {string|string[]} orderUids - The order UID(s) to cancel.
   * @returns {Promise<void>}
   */
  async cancelOrder (orderUids) {
    if (typeof this._account.signTypedData !== 'function') {
      throw new Error("The 'cancelOrder(orderUids)' method requires the protocol to be initialized with a non read-only account.")
    }

    const uids = Array.isArray(orderUids) ? orderUids : [orderUids]
    const network = await this._provider.getNetwork()
    const chainId = Number(network.chainId)

    const settlementAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

    const domain = {
      name: 'Gnosis Protocol',
      version: 'v2',
      chainId,
      verifyingContract: settlementAddress
    }

    const types = {
      OrderCancellations: [
        { name: 'orderUids', type: 'bytes[]' }
      ]
    }

    const signature = await this._account.signTypedData({
      domain,
      types,
      message: {
        orderUids: uids
      }
    })

    const cowApi = await this._getCowApi()
    await cowApi.sendSignedOrderCancellations({
      orderUids: uids,
      signature,
      signingScheme: this._account instanceof WalletAccountEvmErc4337 ? SigningScheme.EIP1271 : SigningScheme.EIP712
    })
  }

  /** @private */
  async _signAndSendOrder (order, appDataDoc) {
    const network = await this._provider.getNetwork()
    const chainId = Number(network.chainId)

    const settlementAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

    const domain = {
      name: 'Gnosis Protocol',
      version: 'v2',
      chainId,
      verifyingContract: settlementAddress
    }

    const types = {
      Order: [
        { name: 'sellToken', type: 'address' },
        { name: 'buyToken', type: 'address' },
        { name: 'receiver', type: 'address' },
        { name: 'sellAmount', type: 'uint256' },
        { name: 'buyAmount', type: 'uint256' },
        { name: 'validTo', type: 'uint32' },
        { name: 'appData', type: 'bytes32' },
        { name: 'feeAmount', type: 'uint256' },
        { name: 'kind', type: 'string' },
        { name: 'partiallyFillable', type: 'bool' },
        { name: 'sellTokenBalance', type: 'string' },
        { name: 'buyTokenBalance', type: 'string' }
      ]
    }

    const signature = await this._account.signTypedData({
      domain,
      types,
      message: {
        ...order,
        sellAmount: BigInt(order.sellAmount),
        buyAmount: BigInt(order.buyAmount),
        feeAmount: BigInt(order.feeAmount),
        validTo: Number(order.validTo),
        partiallyFillable: !!order.partiallyFillable
      }
    })

    const address = await this._account.getAddress()
    const cowApi = await this._getCowApi()

    const orderUid = await cowApi.sendOrder({
      ...order,
      from: address,
      signature,
      signingScheme: this._account instanceof WalletAccountEvmErc4337 ? SigningScheme.EIP1271 : SigningScheme.EIP712,
      appData: appDataDoc
    })

    // For limit orders (feeAmount is 0), we return immediately as they might not fill for a long time.
    // For swaps (market orders), we poll for a short period to confirm execution.
    if (order.feeAmount === '0') {
      return {
        hash: orderUid,
        fee: 0n,
        tokenInAmount: BigInt(order.sellAmount),
        tokenOutAmount: BigInt(order.buyAmount)
      }
    }

    // Poll for order fulfillment
    let orderStatus = 'open'
    let txHash = null
    const startTime = Date.now()

    const formatStatus = (status) => {
      switch (status) {
        case 'open': return 'Processing...'
        case 'scheduled': return 'Scheduling...'
        case 'fulfilled': return 'Success!'
        case 'cancelled': return 'Cancelled'
        case 'expired': return 'Expired'
        default: return status.charAt(0).toUpperCase() + status.slice(1)
      }
    }

    // 1 minute timeout for polling
    while ((orderStatus === 'open' || orderStatus === 'scheduled') && (Date.now() - startTime < 60000)) {
      try {
        const orderData = await cowApi.getOrder(orderUid)
        orderStatus = orderData.status
        txHash = orderData.ethflowData?.txHash || orderData.settlementTxHash
        console.log(`Order status: ${formatStatus(orderStatus)}${txHash ? ` (TX: ${txHash})` : ''}`)
        if (orderStatus === 'fulfilled') break
      } catch (e) {
        // Ignore errors during polling (e.g. 404 if order not indexed yet)
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    if (orderStatus !== 'fulfilled' && orderStatus !== 'open') {
      // Only throw if it's explicitly failed
      if (['cancelled', 'expired', 'presignaturePending'].includes(orderStatus)) {
        throw new Error(`Order execution failed with status: ${orderStatus}`)
      }
    }

    return {
      hash: txHash || orderUid,
      fee: BigInt(order.feeAmount),
      tokenInAmount: BigInt(order.sellAmount),
      tokenOutAmount: BigInt(order.buyAmount)
    }
  }

  /** @private */
  async _getCowApi () {
    if (!this._cowApi) {
      const network = await this._provider.getNetwork()
      const chainId = Number(network.chainId)
      this._cowApi = new OrderBookApi({ chainId, env: 'prod' })
    }

    return this._cowApi
  }

  /** @private */
  async _getSwapOrder ({ tokenIn, tokenOut, tokenInAmount, tokenOutAmount, to, validTo }) {
    const cowApi = await this._getCowApi()

    const address = await this._account.getAddress()

    const { appDataHash, appDataDoc } = this._getAppData()

    const kind = tokenInAmount ? OrderKind.SELL : OrderKind.BUY
    const amount = tokenInAmount ? tokenInAmount.toString() : tokenOutAmount.toString()

    const quoteRequest = {
      sellToken: tokenIn,
      buyToken: tokenOut,
      from: address,
      receiver: to || address,
      kind,
      partiallyFillable: false,
      sellTokenBalance: 'erc20',
      buyTokenBalance: 'erc20',
      appData: appDataHash,
      appDataConfig: {
        fullAppData: appDataDoc
      }
    }

    if (kind === OrderKind.SELL) {
      quoteRequest.sellAmountBeforeFee = amount
    } else {
      quoteRequest.buyAmountAfterFee = amount
    }

    const quoteResponse = await cowApi.getQuote(quoteRequest)

    const network = await this._provider.getNetwork()
    const chainId = Number(network.chainId)
    const isSepolia = chainId === 11155111

    const order = {
      ...quoteResponse.quote,
      appData: appDataHash,
      sellAmount: isSepolia && kind === OrderKind.SELL ? amount : quoteResponse.quote.sellAmount,
      feeAmount: isSepolia ? '0' : quoteResponse.quote.feeAmount,
      validTo: validTo || quoteResponse.quote.validTo
    }

    return {
      quote: quoteResponse.quote,
      order,
      appDataDoc
    }
  }

  /** @private */
  _getAppData () {
    const appDataDoc = {
      version: '1.14.0',
      appCode: 'wdk-cowswap-protocol-evm',
      metadata: {}
    }

    const appDataStr = JSON.stringify(appDataDoc)
    const appDataHash = keccak256(toUtf8Bytes(appDataStr))

    return {
      appDataHash,
      appDataDoc: appDataStr
    }
  }
}
