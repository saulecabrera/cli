import {appManagementRequest, handleDeprecations} from './app-management.js'
import {graphqlRequest, GraphQLResponse} from './graphql.js'
import {appManagementFqdn} from '../context/fqdn.js'
import {setNextDeprecationDate} from '../../../private/node/context/deprecations-store.js'
import {test, vi, expect, describe, beforeEach, beforeAll} from 'vitest'

vi.mock('./graphql.js')
vi.mock('../../../private/node/context/deprecations-store.js')
vi.mock('../context/fqdn.js')

const mockedResult = 'OK'
const appManagementFqdnValue = 'shopify.com'
const orgId = Math.floor(Math.random() * 1000000000000).toString()
const url = `https://${appManagementFqdnValue}/app_management/unstable/organizations/${orgId}/graphql`

const mockedToken = 'token'

beforeEach(() => {
  vi.mocked(appManagementFqdn).mockResolvedValue(appManagementFqdnValue)
})

describe('appManagementRequest', () => {
  test('graphqlRequest is called with correct parameters', async () => {
    // Given
    vi.mocked(graphqlRequest).mockResolvedValue(mockedResult)

    // When
    await appManagementRequest(orgId, 'query', mockedToken, {variables: 'variables'})

    // Then
    expect(graphqlRequest).toHaveBeenLastCalledWith({
      query: 'query',
      api: 'App Management',
      url,
      token: mockedToken,
      variables: {variables: 'variables'},
      responseOptions: {onResponse: handleDeprecations},
    })
  })
})

describe('handleDeprecations', () => {
  beforeAll(() => {
    vi.mocked(setNextDeprecationDate)
  })

  test('does not call setNextDeprecationDate if response contains no deprecations', () => {
    // Given
    const response = {data: {}} as GraphQLResponse<object>

    // When
    handleDeprecations(response)

    // Then
    expect(setNextDeprecationDate).not.toBeCalled()
  })

  test('calls setNextDeprecationDate with response extensions deprecation dates', () => {
    // Given
    const deprecationDates = [new Date()]
    const deprecations = deprecationDates.map((supportedUntilDate) => ({supportedUntilDate}))
    const response = {data: {}, extensions: {deprecations}} as GraphQLResponse<object>

    // When
    handleDeprecations(response)

    // Then
    expect(setNextDeprecationDate).toHaveBeenLastCalledWith(deprecationDates)
  })
})
