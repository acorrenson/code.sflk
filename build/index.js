"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
var path = require("path");
var fs = require("fs");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
var config_1 = require("./config");
var client;
function activate(context) {
    var config = new config_1.WorkspaceConfiguration();
    var binary = findBinary(config.get("sflk.serverPath"));
    var cmd = {
        command: binary,
        options: { env: { RUST_BACKTRACE: "1" } },
    };
    var serverOptions = { run: cmd, debug: cmd };
    // Options to control the language client
    var clientOptions = {
        documentSelector: [{ scheme: "file", language: "sflk" }],
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher("**/*.sflk"),
        },
    };
    // Create the language client and start the client.
    client = new vscode_languageclient_1.LanguageClient("sflk-lsp", "Sflk LSP", serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
function findBinary(pathOrName) {
    var _a, _b;
    if (path.isAbsolute(pathOrName))
        return pathOrName;
    else
        for (var _i = 0, _c = (_b = (_a = process.env.PATH) === null || _a === void 0 ? void 0 : _a.split(path.delimiter)) !== null && _b !== void 0 ? _b : []; _i < _c.length; _i++) {
            var dir = _c[_i];
            var absolute = path.join(dir, pathOrName);
            if (fs.existsSync(absolute))
                return absolute;
        }
    throw new Error("Server at \"" + pathOrName + " not found");
}
