"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
const candidatePaths = [
    (0, node_path_1.resolve)(__dirname, '..', '.env'),
    (0, node_path_1.resolve)(process.cwd(), '.env'),
];
for (const envPath of candidatePaths) {
    if (!(0, node_fs_1.existsSync)(envPath)) {
        continue;
    }
    (0, dotenv_1.config)({ path: envPath });
    break;
}
//# sourceMappingURL=loadEnv.js.map