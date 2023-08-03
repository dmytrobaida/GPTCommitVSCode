import * as vscode from "vscode";

import { getRepositoryFromGitExtension } from "@utils/repository";

import { DiffProvider } from "./diff-provider";
import { GitExtension, Repository } from "../types";

export class VscodeGitDiffProvider implements DiffProvider {
  repository: Repository;

  constructor(gitExtension: vscode.Extension<GitExtension>) {
    this.repository = getRepositoryFromGitExtension(gitExtension);
  }

  async getStagedDiff(excludeFiles?: string[]) {
    const diff = await this.repository.diff(true);
    return diff;
  }
}
