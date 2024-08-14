#! /usr/bin/env node
const fs = require('fs')
const path = require('path')
const program = require('commander')
const cli = require('../lib').default
const packageJSON = require('../package.json')

const cwd = process.cwd()

program
  .version(packageJSON.version)
  .usage('<command> [options]')
  .command('deploy <configFile>')
  .option('--targetDir <targetDir>', 'deploy target dir')
  .description('deploy ns-mfe repository from a config file')
  .action((configFile, options) => {
    if (!fs.existsSync(configFile)) {
      console.error('config file not exist')
      process.exit(1)
    }

    const config = /\.(js|json)$/i.test(configFile)
      ? require(path.join(cwd, configFile))
      : JSON.parse(fs.readFileSync(configFile, 'utf8'))

    if (options.targetDir) {
      config.targetDir = options.targetDir
    }

    cli
      .deploy(config)
      .then(() => {
        process.exit(0)
      })
      .catch(err => {
        console.log(err)
        process.exit(1)
      })
  })

program.parse(process.argv)
