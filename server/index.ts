import * as path from "path";
import * as fs from "fs";
import { workspace, ExtensionContext } from "vscode";

import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient";
import { WorkspaceConfiguration } from "./config";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const config = new WorkspaceConfiguration();
  let binary = findBinary(config.get("sflk.serverPath"));
  const cmd: Executable = {
    command: binary,
    options: { env: { RUST_BACKTRACE: "1" } },
  };
  let serverOptions: ServerOptions = { run: cmd, debug: cmd };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "sflk" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.sflk"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "sflk-lsp",
    "Sflk LSP",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

function findBinary(pathOrName: string): string {
  if (path.isAbsolute(pathOrName)) return pathOrName;
  else
    for (const dir of process.env.PATH?.split(path.delimiter) ?? []) {
      const absolute = path.join(dir, pathOrName);
      if (fs.existsSync(absolute)) return absolute;
    }

  throw new Error(`Server at "${pathOrName} not found`);
}
