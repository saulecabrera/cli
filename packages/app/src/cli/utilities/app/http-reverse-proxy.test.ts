import {runConcurrentHTTPProcessesAndPathForwardTraffic} from './http-reverse-proxy.js'
import httpProxy from 'http-proxy'
import {describe, expect, test, vi} from 'vitest'
import {getAvailableTCPPort} from '@shopify/cli-kit/node/tcp'
import {renderConcurrent} from '@shopify/cli-kit/node/ui'

vi.mock('@shopify/cli-kit/node/ui')
vi.mock('@shopify/cli-kit/node/tcp')
vi.mock('http-proxy', () => {
  return {
    default: {
      createProxy: vi.fn(),
    },
  }
})
vi.mock('http', () => {
  return {
    createServer: () => {
      return {
        on: vi.fn(),
        listen: vi.fn(),
      }
    },
  }
})

describe('runConcurrentHTTPProcessesAndPathForwardTraffic', () => {
  test('proxies to all the targets using the HTTP Proxy', async () => {
    // Given
    const server: any = {register: vi.fn(), listen: vi.fn(), close: vi.fn()}
    vi.mocked(getAvailableTCPPort).mockResolvedValueOnce(3001)
    vi.mocked(getAvailableTCPPort).mockResolvedValueOnce(3002)

    // When
    const got = await runConcurrentHTTPProcessesAndPathForwardTraffic({
      previewUrl: '',
      portNumber: 3000,
      proxyTargets: [
        {
          logPrefix: 'extensions',
          pathPrefix: '/extensions',
          action: async (stdout, stderr, signal, port) => {},
        },
        {
          logPrefix: 'web',
          action: async (stdout, stderr, signal, port) => {},
        },
      ],
      additionalProcesses: [],
      app: {
        canEnablePreviewMode: false,
        developmentStorePreviewEnabled: false,
        apiKey: '',
        token: '',
      },
    })

    // Then
    expect(httpProxy.createProxy).toHaveBeenCalled()

    const concurrentCalls = vi.mocked(renderConcurrent).mock.calls
    expect(concurrentCalls.length).toEqual(1)
    const concurrentProcesses = concurrentCalls[0]?.[0]?.processes ?? []
    expect(concurrentProcesses[0]?.prefix).toEqual('extensions')
    expect(concurrentProcesses[1]?.prefix).toEqual('web')
    expect(server.close).not.toHaveBeenCalled()
  })
})
