import {testFunctionExtension} from '../app/app.test-data.js'
import {FunctionConfigType} from '../extensions/specifications/function.js'
import {joinPath} from '@shopify/cli-kit/node/path'
import {describe, expect, test} from 'vitest'

function functionConfiguration(): FunctionConfigType {
  return {
    name: 'foo',
    type: 'function',
    api_version: '2023-07',
    configuration_ui: true,
    metafields: [],
    build: {},
  }
}

describe('watchPaths', async () => {
  test('returns an array for a single path', async () => {
    const config = functionConfiguration()
    config.build = {
      watch: 'src/single-path.foo',
    }
    const extensionInstance = await testFunctionExtension({
      config,
      dir: 'foo',
    })

    const got = extensionInstance.watchPaths

    expect(got).toEqual([joinPath('foo', 'src', 'single-path.foo'), joinPath('foo', '**', 'input*.graphql')])
  })

  test('returns default paths for javascript', async () => {
    const config = functionConfiguration()
    config.build = {}
    const extensionInstance = await testFunctionExtension({
      config,
      entryPath: 'src/index.js',
      dir: 'foo',
    })

    const got = extensionInstance.watchPaths

    expect(got).toEqual([
      joinPath('foo', 'src', '**', '*.js'),
      joinPath('foo', 'src', '**', '*.ts'),
      joinPath('foo', '**', 'input*.graphql'),
    ])
  })

  test('returns configured paths and input query', async () => {
    const config = functionConfiguration()
    config.build = {
      watch: ['src/**/*.rs', 'src/**/*.foo'],
    }
    const extensionInstance = await testFunctionExtension({
      config,
      dir: 'foo',
    })

    const got = extensionInstance.watchPaths

    expect(got).toEqual([
      joinPath('foo', 'src/**/*.rs'),
      joinPath('foo', 'src/**/*.foo'),
      joinPath('foo', '**', 'input*.graphql'),
    ])
  })

  test('returns null if not javascript and not configured', async () => {
    const config = functionConfiguration()
    config.build = {}
    const extensionInstance = await testFunctionExtension({
      config,
    })

    const got = extensionInstance.watchPaths

    expect(got).toBeNull()
  })
})
