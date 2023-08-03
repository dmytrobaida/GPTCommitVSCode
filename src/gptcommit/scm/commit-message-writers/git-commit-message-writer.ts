import * as vscode from "vscode";

import { GitExtension, Repository } from "@gptcommit/scm/types";
import { getRepositoryFromGitExtension } from "@utils/repository";

import { CommitMessageWriter } from "./commit-message-writer";

export class GitCommitMessageWriter implements CommitMessageWriter {
  repository: Repository;

  constructor(gitExtension: vscode.Extension<GitExtension>) {
    this.repository = getRepositoryFromGitExtension(gitExtension);
  }

  async write(message: string) {
    this.repository.inputBox.value = message;
  }
}
