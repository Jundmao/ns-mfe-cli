/**
 * https://dev.dingxiang-inc.com/help/api/repositories.md
 * https://dev.dingxiang-inc.com/help/api/repository_files.md
 */
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { WriteStream } from 'fs'

import debug from 'debug'
import fse from 'fs-extra'
import axios from 'axios'
import { extract } from 'tar'

import { DeployOptions } from './typings'

function finished(event: WriteStream): Promise<void> {
  return new Promise(
    (resolve, reject): void => {
      event.on('finish', resolve)
      event.on('error', reject)
    }
  )
}

class NsMfeCli {
  private debug: debug.Debugger
  private tmpDir: string

  public constructor() {
    this.debug = debug('ns-mfe-cli')
    this.tmpDir = path.join(os.tmpdir(), 'ns-mfe-cli')
  }

  public async deploy(options: DeployOptions): Promise<void> {
    if (!options.apps.length) {
      this.debug('no apps to deploy')
      return
    }

    const deployDir = path.join(
      this.tmpDir,
      crypto.randomBytes(16).toString('hex')
    )
    const token: string = options.token || ''
    const sourceServer: string = options.sourceServer || ''
    const targetDir: string = path.join(
      process.cwd(),
      options.targetDir || 'build/apps'
    )

    try {
      for (let i = 0; i < options.apps.length; i++) {
        const app = options.apps[i]
        const deployAppDir = path.join(deployDir, app.name)
        const targetAppDir = app.targetDir || path.join(targetDir, app.name)
        const branch = app.branch
        const tar = app.tar || 'build.tar.gz'

        fse.ensureDirSync(deployAppDir)

        const response = await axios({
          url: `${sourceServer}/api/v4/projects/${
            app.projectId
          }/repository/files/${encodeURIComponent(tar)}/raw?ref=${branch}`,
          headers: {
            'PRIVATE-TOKEN': token
          },
          responseType: 'stream'
        })
        await finished(
          response.data.pipe(
            fse.createWriteStream(path.join(deployAppDir, tar))
          )
        )
        await extract({
          file: path.join(deployAppDir, tar),
          cwd: deployAppDir
        })

        fse.moveSync(path.join(deployAppDir, 'build'), targetAppDir, {
          overwrite: true
        })
      }
    } catch (err) {
      // 出错的时候注意也要清理
      fse.removeSync(deployDir)
      throw err
    }

    fse.removeSync(deployDir)
  }
}

export default new NsMfeCli()
