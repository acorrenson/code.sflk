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
  // The server is implemented in node
  let binary = findBinary(config.get("sflk.serverPath"));
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const cmd: Executable = {
    command: binary,
    options: { env: { RUST_BACKTRACE: "1" } },
  };
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = { run: cmd, debug: cmd };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "sflk" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
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
