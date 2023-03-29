/*
 * This code includes portions of code from the aicommits project, which is
 * licensed under the MIT License. Copyright (c) Hassan El Mghari.
 * The original code can be found at https://github.com/Nutlope/aicommits/blob/develop/src/commands/aicommits.ts
 */

import * as vscode from 'vscode';

import { assertGitRepo, getStagedDiff } from "./utils/git";
import { generateCommitMessage } from './utils/openai';

async function generateAICommitMessage(apiKey: string) {
    await assertGitRepo();

    const staged = await getStagedDiff();

    if (!staged) {
        vscode.window.showErrorMessage('No staged changes found. Make sure to stage your changes with `git add`.');
        return;
    }

    let message = await generateCommitMessage(
        apiKey,
        staged.diff,
    );

    if (!message) {
        vscode.window.showErrorMessage('No commit message were generated. Try again.');
        return;
    }

    const result = await vscode.window.showQuickPick(['Yes', 'No'], {
        title: `Use this commit message?\n\n   ${message}\n`,
    });

    if (result !== 'Yes') {
        return;
    }

    return message;
};

export default generateAICommitMessage;
