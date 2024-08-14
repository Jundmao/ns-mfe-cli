import cli from  '../src'

describe('cli', () => {
  test('it should have deploy api', () => {
    expect(cli.deploy).toBeTruthy()
  })
})
