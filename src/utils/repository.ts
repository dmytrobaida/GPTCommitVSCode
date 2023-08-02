import * as vscode from "vscode";

import { GitExtension } from "@gptcommit/scm/types";

export function getRepositoryFromGitExtension(
  gitExtension: vscode.Extension<GitExtension>
) {
  if (!gitExtension.isActive) {
    throw new Error("Git extension is not active");
  }

  const repositories = gitExtension.exports.getAPI(1).repositories;

  if (repositories.length === 0) {
    throw new Error("No repositories found");
  }

  // TODO: Add support for multiple repositories
  return repositories[0];
}
