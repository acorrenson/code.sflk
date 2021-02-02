import { workspace } from "vscode";
import * as vscode from "vscode";

export interface Configuration {
  "sflk.serverPath": string;
}

export class WorkspaceConfiguration {
  private _wsConfig?: vscode.WorkspaceConfiguration;
  constructor(public readonly section?: string) { }

  public get config(): vscode.WorkspaceConfiguration {
    if (!this._wsConfig) this._wsConfig = workspace.getConfiguration(this.section);
    return this._wsConfig;
  }

  public has<K extends keyof Configuration>(key: K): boolean {
    return this.config.has(key);
  }

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return this.config.get<Configuration[K]>(key)!;
  }

  public async set<K extends keyof Configuration, V extends Configuration[K]>(key: K, value: V) {
    await this.config.update(key, value);
  }
}