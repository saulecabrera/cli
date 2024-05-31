import {
  appNamePrompt,
  createAsNewAppPrompt,
  reloadStoreListPrompt,
  selectAppPrompt,
  selectOrganizationPrompt,
  selectFunctionRunPrompt,
  selectStorePrompt,
  updateURLsPrompt,
} from './dev.js'
import {Organization, OrganizationStore} from '../models/organization.js'
import {FunctionRunData} from '../services/function/replay.js'
import {testDeveloperPlatformClient, testOrganizationApp} from '../models/app/app.test-data.js'
import {getTomls} from '../utilities/app/config/getTomls.js'
import {searchForAppsByNameFactory} from '../services/dev/prompt-helpers.js'
import {describe, expect, vi, test, beforeEach} from 'vitest'
import {renderAutocompletePrompt, renderConfirmationPrompt, renderTextPrompt} from '@shopify/cli-kit/node/ui'
import {mockAndCaptureOutput} from '@shopify/cli-kit/node/testing/output'

vi.mock('@shopify/cli-kit/node/ui')
vi.mock('../utilities/app/config/getTomls')

const ORG1: Organization = {
  id: '1',
  businessName: 'org1',
}
const ORG2: Organization = {
  id: '2',
  businessName: 'org2',
}
const APP1 = testOrganizationApp({apiKey: 'key1'})
const APP2 = testOrganizationApp({
  id: '2',
  title: 'app2',
  apiKey: 'key2',
  apiSecretKeys: [{secret: 'secret2'}],
})
const STORE1: OrganizationStore = {
  shopId: '1',
  link: 'link1',
  shopDomain: 'domain1',
  shopName: 'store1',
  transferDisabled: false,
  convertableToPartnerTest: false,
}
const STORE2: OrganizationStore = {
  shopId: '2',
  link: 'link2',
  shopDomain: 'domain2',
  shopName: 'store2',
  transferDisabled: false,
  convertableToPartnerTest: false,
}
const RUN1: FunctionRunData = {
  shop_id: 69665030382,
  api_client_id: 124042444801,
  payload: {
    input: '{}',
    input_bytes: 136,
    output: '{}',
    output_bytes: 195,
    function_id: '34236fa9-42f5-4bb6-adaf-956e12fff0b0',
    logs: '',
    fuel_consumed: 458206,
  },
  event_type: 'function_run',
  cursor: '2024-05-31T15:29:47.291530Z',
  status: 'success',
  log_timestamp: '2024-05-31T15:29:46.741270Z',
  identifier: 'abcdef',
}

const RUN2: FunctionRunData = {
  shop_id: 69665030382,
  api_client_id: 124042444801,
  payload: {
    input: '{}',
    input_bytes: 136,
    output: '{}',
    output_bytes: 195,
    function_id: '34236fa9-42f5-4bb6-adaf-956e12fff0b0',
    logs: '',
    fuel_consumed: 458206,
  },
  event_type: 'function_run',
  cursor: '2024-05-31T15:29:47.291530Z',
  status: 'success',
  log_timestamp: '2024-05-31T15:29:46.741270Z',
  identifier: 'abc123',
}

beforeEach(() => {
  vi.mocked(getTomls).mockResolvedValue({})
})

describe('selectOrganization', () => {
  test('request org selection if passing more than 1 org', async () => {
    // Given
    vi.mocked(renderAutocompletePrompt).mockResolvedValue('1')

    // When
    const got = await selectOrganizationPrompt([ORG1, ORG2])

    // Then
    expect(got).toEqual(ORG1)
    expect(renderAutocompletePrompt).toHaveBeenCalledWith({
      message: 'Which organization is this work for?',
      choices: [
        {label: 'org1', value: '1'},
        {label: 'org2', value: '2'},
      ],
    })
  })

  test('returns directly if passing only 1 org', async () => {
    // Given
    const orgs = [ORG2]

    // When
    const got = await selectOrganizationPrompt(orgs)

    // Then
    expect(got).toEqual(ORG2)
    expect(renderAutocompletePrompt).not.toBeCalled()
  })
})

describe('selectFunctionRun', () => {
  test('returns run if user selects one', async () => {
    // Given
    const runs = [RUN1, RUN2]
    vi.mocked(renderAutocompletePrompt).mockResolvedValue(RUN2)

    // When
    const got = await selectFunctionRunPrompt(runs)

    // Then
    expect(got).toEqual(RUN2)
    expect(renderAutocompletePrompt).toHaveBeenCalledWith({
      message: 'Which run would you like to replay?',
      choices: [
        {label: `${RUN1.log_timestamp} (${RUN1.status}) - ${RUN1.identifier}`, value: RUN1},
        {label: `${RUN2.log_timestamp} (${RUN2.status}) - ${RUN2.identifier}`, value: RUN1},
      ],
    })
  })
})

describe('selectApp', () => {
  test('returns app if user selects one', async () => {
    // Given
    const apps = [APP1, APP2]
    vi.mocked(renderAutocompletePrompt).mockResolvedValue(APP2.apiKey)

    // When
    const got = await selectAppPrompt(searchForAppsByNameFactory(testDeveloperPlatformClient(), ORG1.id), apps, true)

    // Then
    expect(got).toEqual(APP2)
    expect(renderAutocompletePrompt).toHaveBeenCalledWith({
      message: 'Which existing app is this for?',
      choices: [
        {label: 'app1', value: 'key1'},
        {label: 'app2', value: 'key2'},
      ],
      search: expect.any(Function),
      hasMorePages: true,
    })
  })

  test('includes toml names when present', async () => {
    vi.mocked(getTomls).mockResolvedValueOnce({
      [APP1.apiKey]: 'shopify.app.toml',
      [APP2.apiKey]: 'shopify.app.dev.toml',
    })

    const apps = [APP1, APP2]
    vi.mocked(renderAutocompletePrompt).mockResolvedValue(APP2.apiKey)

    const got = await selectAppPrompt(searchForAppsByNameFactory(testDeveloperPlatformClient(), ORG1.id), apps, true, {
      directory: '/',
    })

    expect(got).toEqual(APP2)
    expect(renderAutocompletePrompt).toHaveBeenCalledWith({
      message: 'Which existing app is this for?',
      choices: [
        {label: 'app1 (shopify.app.toml)', value: 'key1'},
        {label: 'app2 (shopify.app.dev.toml)', value: 'key2'},
      ],
      search: expect.any(Function),
      hasMorePages: true,
    })
  })
})

describe('selectStore', () => {
  test('returns undefined if store list is empty', async () => {
    // Given
    const stores: OrganizationStore[] = []

    // When
    const got = await selectStorePrompt(stores)

    // Then
    expect(got).toEqual(undefined)
    expect(renderAutocompletePrompt).not.toBeCalled()
  })

  test('returns without asking if there is only 1 store', async () => {
    // Given
    const stores: OrganizationStore[] = [STORE1]
    const outputMock = mockAndCaptureOutput()

    // When
    const got = await selectStorePrompt(stores)

    // Then
    expect(got).toEqual(STORE1)
    expect(renderAutocompletePrompt).not.toBeCalled()
    expect(outputMock.output()).toMatch('Using your default dev store, store1, to preview your project')
  })

  test('returns store if user selects one', async () => {
    // Given
    const stores: OrganizationStore[] = [STORE1, STORE2]
    vi.mocked(renderAutocompletePrompt).mockResolvedValue('2')

    // When
    const got = await selectStorePrompt(stores)

    // Then
    expect(got).toEqual(STORE2)
    expect(renderAutocompletePrompt).toHaveBeenCalledWith({
      message: 'Which store would you like to use to view your project?',
      choices: [
        {label: 'store1', value: '1'},
        {label: 'store2', value: '2'},
      ],
    })
  })
})

describe('appName', () => {
  test('asks the user to write a name and returns it', async () => {
    // Given
    vi.mocked(renderTextPrompt).mockResolvedValue('app-name')

    // When
    const got = await appNamePrompt('suggested-name')

    // Then
    expect(got).toEqual('app-name')
    expect(renderTextPrompt).toHaveBeenCalledWith({
      message: 'App name',
      defaultValue: 'suggested-name',
      validate: expect.any(Function),
    })
  })
})

describe('reloadStoreList', () => {
  test('returns true if user selects reload', async () => {
    // Given
    vi.mocked(renderConfirmationPrompt).mockResolvedValue(true)

    // When
    const got = await reloadStoreListPrompt(ORG1)

    // Then
    expect(got).toEqual(true)
    expect(renderConfirmationPrompt).toHaveBeenCalledWith({
      message: 'Finished creating a dev store?',
      confirmationMessage: 'Yes, org1 has a new dev store',
      cancellationMessage: 'No, cancel dev',
    })
  })
})

describe('createAsNewAppPrompt', () => {
  test('returns true if user selects to create a new app', async () => {
    // Given
    vi.mocked(renderConfirmationPrompt).mockResolvedValue(true)

    // When
    const got = await createAsNewAppPrompt()

    // Then
    expect(got).toEqual(true)
    expect(renderConfirmationPrompt).toHaveBeenCalledWith({
      message: 'Create this project as a new app on Shopify?',
      confirmationMessage: 'Yes, create it as a new app',
      cancellationMessage: 'No, connect it to an existing app',
    })
  })
})

describe('updateURLsPrompt', () => {
  test('asks about the URL update and shows 4 different options', async () => {
    // Given
    vi.mocked(renderConfirmationPrompt).mockResolvedValue(true)

    // When
    const got = await updateURLsPrompt('http://current-url', [
      'http://current-redirect-url1',
      'http://current-redirect-url2',
    ])

    // Then
    expect(got).toEqual(true)
    expect(renderConfirmationPrompt).toHaveBeenCalledWith({
      message: `Have Shopify automatically update your app's URL in order to create a preview experience?`,
      infoTable: {
        'Current app URL': ['http://current-url'],
        'Current redirect URLs': ['http://current-redirect-url1', 'http://current-redirect-url2'],
      },
      confirmationMessage: 'Yes, automatically update',
      cancellationMessage: 'No, never',
    })
  })
})
