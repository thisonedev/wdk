import { beforeEach, describe, expect, jest, test, beforeAll, afterAll } from '@jest/globals'

import * as ethers from 'ethers'

import * as cowSdk from '@cowprotocol/cow-sdk'

import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const SEED = 'emerge arctic potato consider female artist corn put fury prefer infant body'

const USER_ADDRESS = '0x331beb03a622FE9f3910a43a36726C4906f0ebA6'

const TOKEN_IN = '0x9e6b38E072f624fdC4Fbaf7bB12a7D9e657435ce'
const TOKEN_OUT = '0x73091d62F1F11DCb172530126E9630e327770e05'

const getQuoteMock = jest.fn()
const sendOrderMock = jest.fn()
const getOrderMock = jest.fn()
const sendSignedOrderCancellationsMock = jest.fn()

// Silence console.log during tests to avoid cluttering the report
console.log = jest.fn()

jest.unstable_mockModule('ethers', () => ({
  ...ethers,
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1n })
  }))
}))

jest.unstable_mockModule('@cowprotocol/cow-sdk', () => ({
  ...cowSdk,
  OrderBookApi: jest.fn().mockImplementation(() => ({
    getQuote: getQuoteMock,
    sendOrder: sendOrderMock,
    getOrder: getOrderMock,
    sendSignedOrderCancellations: sendSignedOrderCancellationsMock
  }))
}))

const { default: CowswapProtocolEvm } = await import('../src/cowswap-protocol-evm.js')

describe('CowswapProtocolEvm', () => {
  const DUMMY_QUOTE_RESPONSE = {
    quote: {
      sellToken: TOKEN_IN,
      buyToken: TOKEN_OUT,
      receiver: USER_ADDRESS,
      sellAmount: '100',
      buyAmount: '100000',
      validTo: 123456789,
      appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeAmount: '10',
      kind: 'sell',
      partiallyFillable: false,
      sellTokenBalance: 'erc20',
      buyTokenBalance: 'erc20'
    }
  }

  const DUMMY_ORDER_UID = 'dummy-order-uid'
  const DUMMY_TX_HASH = 'dummy-tx-hash'

  const DUMMY_ORDER_RESPONSE = {
    status: 'fulfilled',
    settlementTxHash: DUMMY_TX_HASH
  }

  let protocol

  const mockAccount = {
    getAddress: jest.fn().mockResolvedValue(USER_ADDRESS),
    signTypedData: jest.fn().mockResolvedValue('dummy-signature'),
    _provider: {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1n })
    }
  }

  describe('with WalletAccountEvm', () => {
    beforeEach(() => {
      protocol = new CowswapProtocolEvm(mockAccount)
      getQuoteMock.mockResolvedValue(DUMMY_QUOTE_RESPONSE)
      sendOrderMock.mockResolvedValue(DUMMY_ORDER_UID)
      // IMPORTANT: Mock getOrder to resolve immediately to avoided timed out unit tests
      getOrderMock.mockResolvedValue(DUMMY_ORDER_RESPONSE)
    })

    describe('swap', () => {
      test('should successfully perform a swap operation (sell)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({
          appData: expect.stringMatching(/^0x[0-9a-f]{64}$/),
          appDataConfig: expect.objectContaining({
            fullAppData: expect.any(String)
          })
        }))

        expect(result).toEqual({
          hash: DUMMY_TX_HASH,
          fee: 10n,
          tokenInAmount: 100n,
          tokenOutAmount: 100000n
        })
      })

      test('should successfully perform a swap operation (buy)', async () => {
        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenOutAmount: 100000
        })

        expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({
          buyAmountAfterFee: '100000',
          kind: 'buy'
        }))

        expect(result).toEqual({
          hash: DUMMY_TX_HASH,
          fee: 10n,
          tokenInAmount: 100n,
          tokenOutAmount: 100000n
        })
      })

      test('should throw if the account is read-only', async () => {
        const readOnlyAccount = {
          getAddress: jest.fn().mockResolvedValue(USER_ADDRESS),
          _provider: mockAccount._provider
        }
        const protocol = new CowswapProtocolEvm(readOnlyAccount)

        await expect(protocol.swap({ }))
          .rejects.toThrow("The 'swap(options)' method requires the protocol to be initialized with a non read-only account.")
      })
    })

    describe('createLimitOrder', () => {
      test('should successfully create a limit order', async () => {
        const result = await protocol.createLimitOrder({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          sellAmount: 100,
          buyAmount: 100000
        })

        expect(sendOrderMock).toHaveBeenCalledWith(expect.objectContaining({
          sellAmount: '100',
          buyAmount: '100000',
          kind: 'sell'
        }))

        expect(result.hash).toBe(DUMMY_ORDER_UID)
      })

      test('should throw if the account is read-only', async () => {
        const readOnlyAccount = {
          getAddress: jest.fn().mockResolvedValue(USER_ADDRESS),
          _provider: mockAccount._provider
        }
        const protocol = new CowswapProtocolEvm(readOnlyAccount)

        await expect(protocol.createLimitOrder({ }))
          .rejects.toThrow("The 'createLimitOrder(options)' method requires the protocol to be initialized with a non read-only account.")
      })
    })

    describe('cancelOrder', () => {
      test('should successfully cancel a single order', async () => {
        await protocol.cancelOrder('dummy-uid')

        expect(sendSignedOrderCancellationsMock).toHaveBeenCalledWith(expect.objectContaining({
          orderUids: ['dummy-uid'],
          signature: 'dummy-signature',
          signingScheme: 'eip712'
        }))
      })

      test('should successfully cancel multiple orders', async () => {
        const uids = ['uid1', 'uid2']
        await protocol.cancelOrder(uids)

        expect(sendSignedOrderCancellationsMock).toHaveBeenCalledWith(expect.objectContaining({
          orderUids: uids
        }))
      })

      test('should throw if the account is read-only', async () => {
        const readOnlyAccount = {
          getAddress: jest.fn().mockResolvedValue(USER_ADDRESS),
          _provider: mockAccount._provider
        }
        const protocol = new CowswapProtocolEvm(readOnlyAccount)

        await expect(protocol.cancelOrder('uid'))
          .rejects.toThrow("The 'cancelOrder(orderUids)' method requires the protocol to be initialized with a non read-only account.")
      })
    })

    describe('quoteSwap', () => {
      test('should successfully quote a swap operation', async () => {
        const result = await protocol.quoteSwap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(result).toEqual({
          fee: 10n,
          tokenInAmount: 100n,
          tokenOutAmount: 100000n
        })
      })
    })

    describe('Edge cases and Error handling', () => {
      let originalSetTimeout

      beforeAll(() => {
        originalSetTimeout = global.setTimeout
        global.setTimeout = (fn) => fn()
      })

      afterAll(() => {
        global.setTimeout = originalSetTimeout
      })

      test('should use Sepolia specific logic when chainId is 11155111', async () => {
        const sepoliaAccount = {
          ...mockAccount,
          _provider: {
            getNetwork: jest.fn().mockResolvedValue({ chainId: 11155111n })
          }
        }
        const sepoliaProtocol = new CowswapProtocolEvm(sepoliaAccount)

        await sepoliaProtocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(sendOrderMock).toHaveBeenCalledWith(expect.objectContaining({
          feeAmount: '0',
          sellAmount: '100'
        }))
      })

      test('should handle various order statuses in formatStatus', async () => {
        const testCases = [
          { status: 'fulfilled', shouldThrow: false },
          { status: 'cancelled', shouldThrow: true },
          { status: 'expired', shouldThrow: true },
          { status: 'presignaturePending', shouldThrow: true },
          { status: 'failed', shouldThrow: false }
        ]

        for (const { status, shouldThrow } of testCases) {
          getOrderMock.mockReset()
          getOrderMock.mockResolvedValue({ status, settlementTxHash: 'tx' })
          
          if (shouldThrow) {
            await expect(protocol.swap({
              tokenIn: TOKEN_IN,
              tokenOut: TOKEN_OUT,
              tokenInAmount: 100
            })).rejects.toThrow(`Order execution failed with status: ${status}`)
          } else {
            const result = await protocol.swap({
              tokenIn: TOKEN_IN,
              tokenOut: TOKEN_OUT,
              tokenInAmount: 100
            })
            expect(result.hash).toBe('tx')
          }
        }

        // Test 'open' status explicitly
        getOrderMock.mockReset()
        getOrderMock
          .mockResolvedValueOnce({ status: 'open', settlementTxHash: 'tx-open' })
          .mockResolvedValueOnce({ status: 'fulfilled', settlementTxHash: 'tx-success' })

        await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        // Test scheduled (it will loop unless we change status)
        getOrderMock.mockReset()
        getOrderMock
          .mockResolvedValueOnce({ status: 'scheduled', settlementTxHash: 'tx' })
          .mockResolvedValueOnce({ status: 'fulfilled', settlementTxHash: 'tx-success' })

        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })
        expect(result.hash).toBe('tx-success')
      })

      test('should handle polling errors and eventually succeed', async () => {
        getOrderMock.mockReset()
        getOrderMock
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({ status: 'fulfilled', settlementTxHash: 'retry-tx-hash' })

        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(result.hash).toBe('retry-tx-hash')
      })

      test('should return order UID if polling times out', async () => {
        getOrderMock.mockReset()
        getOrderMock.mockResolvedValue({ status: 'open' })

        // Mock Date.now to simulate timeout
        const originalDateNow = Date.now
        let currentTime = 1000
        Date.now = () => {
          currentTime += 100000 // jump 100s each call
          return currentTime
        }

        const result = await protocol.swap({
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          tokenInAmount: 100
        })

        expect(result.hash).toBe(DUMMY_ORDER_UID)
        
        Date.now = originalDateNow
      })
    })
  })

  describe('with EIP-1271 signing scheme', () => {
    test('should successfully perform a swap operation with EIP-1271 signing scheme', async () => {
      // Create an object that passes "instanceof WalletAccountEvmErc4337"
      const erc4337Account = Object.create(WalletAccountEvmErc4337.prototype)
      Object.assign(erc4337Account, {
        getAddress: jest.fn().mockResolvedValue(USER_ADDRESS),
        signTypedData: jest.fn().mockResolvedValue('dummy-signature'),
        _provider: mockAccount._provider
      })

      const protocol = new CowswapProtocolEvm(erc4337Account)

      getQuoteMock.mockResolvedValue(DUMMY_QUOTE_RESPONSE)
      sendOrderMock.mockResolvedValue(DUMMY_ORDER_UID)
      getOrderMock.mockResolvedValue(DUMMY_ORDER_RESPONSE)

      await protocol.swap({
        tokenIn: TOKEN_IN,
        tokenOut: TOKEN_OUT,
        tokenInAmount: 100
      })

      expect(sendOrderMock).toHaveBeenCalledWith(expect.objectContaining({
        signingScheme: 'eip1271'
      }))
    })
  })
})
