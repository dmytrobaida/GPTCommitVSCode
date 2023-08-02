/*
 * This code includes portions of code from the aicommits project, which is
 * licensed under the MIT License. Copyright (c) Hassan El Mghari.
 * The original code can be found at https://github.com/Nutlope/aicommits/blob/develop/src/utils/git.ts.
 */

import { execa } from "execa";
import * as vscode from "vscode";

import { DiffProvider } from "./diff-provider";

const cwd = vscode.workspace?.workspaceFolders
  ? vscode.workspace?.workspaceFolders[0].uri.path
  : undefined;

const excludeFromDiff = (path: string) => `:(exclude)${path}`;

const filesToExclude = [
  "package-lock.json",
  "pnpm-lock.yaml",

  // yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
  "*.lock",
].map(excludeFromDiff);

/**
 * @deprecated This class is deprecated. Use `VscodeGitDiffProvider` instead.
 */
export class ExecaGitDiffProvider implements DiffProvider {
  async getStagedDiff(excludeFiles?: string[]) {
    const diffCached = ["diff", "--cached"];
    const { stdout: diff } = await execa(
      "git",
      [...diffCached, ...filesToExclude],
      {
        cwd: cwd,
      }
    );

    return diff;
  }
}
