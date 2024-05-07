/**
 * @jest-environment node
 */
const fs = require('fs')

/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const github = require('@actions/github')
const main = require('../src/main')

// Mock the GitHub Actions core library
const infoMock = jest.spyOn(core, 'info').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Import the resolveTagFormat function for testing
const { resolveTagFormat } = require('../src/main');
const { beforeEach } = require('node:test')

describe('resolveTagFormat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should replace placeholders with current year and month values', () => {
    const result = resolveTagFormat('${year}.${month}', null);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    expect(result).toBe(`${year}.${month}`);
  });

  it('should replace placeholders with year and month values from given version object', () => {
    const result = resolveTagFormat('${year}.${month}', { year: 2023, month: 4 });
    expect(result).toBe('2023.04');
  });

  it('should return the tag format as is if no placeholders are present', () => {
    const result = resolveTagFormat('v1.0.0', null);
    expect(result).toBe('v1.0.0');
  });

  it('should return the tag format containing ${rev} placeholder', () => {
    const result = resolveTagFormat('${year}.${month}-tk-config-default2.1.4.5.${rev}', { year: 2023, month: 4 });
    expect(result).toBe('2023.04-tk-config-default2.1.4.5.${rev}');
  });

});

// describe('action', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   it('should replace placeholders with actual year and month values', async () => {
//     // Mock the action's inputs
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'tag-format':
//           return '${year}.${month}'
//         default:
//           return ''
//       }
//     })

//     // Mock the action's payload
//     github.context.payload = {}

//     await main.run()

//     const currentDate = new Date()
//     const year = currentDate.getFullYear()
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0')

//     expect(runMock).toHaveReturned()
//     expect(setOutputMock).toHaveBeenCalledWith('version', `${year}.${month}`)
//   })

//   it('should replace placeholders with year and month values from version.json if provided', async () => {
//     // Mock the action's inputs
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'tag-format':
//           return '${year}.${month}'
//         case 'version-file':
//           return 'path/to/version.json' // Mock the version file path
//         default:
//           return ''
//       }
//     })

//     // Mock the version file content
//     const versionContent = JSON.stringify({ year: 2023, month: 12 })
//     jest.spyOn(fs, 'readFileSync').mockReturnValue(versionContent)

//     // Mock the action's payload
//     github.context.payload = {}

//     // const resolvedTagFormat = resolveTagFormat('${year}.${month}', { year: 2023, month: 12 })
//     expect(resolvedTagFormat).toBe('2023.12')

//     await main.run()

//     expect(runMock).toHaveReturned()
//     expect(setOutputMock).toHaveBeenCalledWith('version', '2023.12')
// })

//   it('logs the event payload', async () => {
//     // Mock the action's inputs
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'who-to-greet':
//           return 'World'
//         default:
//           return ''
//       }
//     })

//     // Mock the action's payload
//     github.context.payload = {
//       actor: 'mona'
//     }

//     await main.run()

//     expect(runMock).toHaveReturned()
//     expect(infoMock).toHaveBeenCalledWith(
//       `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
//     )
//   })

//   it('sets a failed status', async () => {
//     // Mock the action's inputs
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'who-to-greet':
//           throw new Error('Something went wrong...')
//         default:
//           return ''
//       }
//     })

//     // Mock the action's payload
//     github.context.payload = {
//       actor: 'mona'
//     }

//     await main.run()

//     expect(runMock).toHaveReturned()
//     expect(setFailedMock).toHaveBeenCalledWith('Something went wrong...')
//   })
// })