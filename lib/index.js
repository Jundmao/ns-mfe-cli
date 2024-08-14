"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const axios_1 = __importDefault(require("axios"));
const tar_1 = require("tar");
function finished(event) {
    return new Promise((resolve, reject) => {
        event.on('finish', resolve);
        event.on('error', reject);
    });
}
class NsMfeCli {
    constructor() {
        this.debug = debug_1.default('ns-mfe-cli');
        this.tmpDir = path_1.default.join(os_1.default.tmpdir(), 'ns-mfe-cli');
    }
    async deploy(options) {
        if (!options.apps.length) {
            this.debug('no apps to deploy');
            return;
        }
        const deployDir = path_1.default.join(this.tmpDir, crypto_1.default.randomBytes(16).toString('hex'));
        const token = options.token || '';
        const sourceServer = options.sourceServer || '';
        const targetDir = path_1.default.join(process.cwd(), options.targetDir || 'build/apps');
        try {
            for (let i = 0; i < options.apps.length; i++) {
                const app = options.apps[i];
                const deployAppDir = path_1.default.join(deployDir, app.name);
                const targetAppDir = app.targetDir || path_1.default.join(targetDir, app.name);
                const branch = app.branch;
                const tar = app.tar || 'build.tar.gz';
                fs_extra_1.default.ensureDirSync(deployAppDir);
                const response = await axios_1.default({
                    url: `${sourceServer}/api/v4/projects/${app.projectId}/repository/files/${encodeURIComponent(tar)}/raw?ref=${branch}`,
                    headers: {
                        'PRIVATE-TOKEN': token
                    },
                    responseType: 'stream'
                });
                await finished(response.data.pipe(fs_extra_1.default.createWriteStream(path_1.default.join(deployAppDir, tar))));
                await tar_1.extract({
                    file: path_1.default.join(deployAppDir, tar),
                    cwd: deployAppDir
                });
                fs_extra_1.default.moveSync(path_1.default.join(deployAppDir, 'build'), targetAppDir, {
                    overwrite: true
                });
            }
        }
        catch (err) {
            fs_extra_1.default.removeSync(deployDir);
            throw err;
        }
        fs_extra_1.default.removeSync(deployDir);
    }
}
exports.default = new NsMfeCli();
