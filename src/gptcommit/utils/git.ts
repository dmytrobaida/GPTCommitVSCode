/*
 * This code includes portions of code from the aicommits project, which is
 * licensed under the MIT License. Copyright (c) Hassan El Mghari.
 * The original code can be found at https://github.com/Nutlope/aicommits/blob/develop/src/utils/git.ts.
 */

import { execa } from 'execa';
import * as vscode from 'vscode';

const cwd = vscode.workspace?.workspaceFolders ? vscode.workspace?.workspaceFolders[0].uri.path : undefined;

export const assertGitRepo = async () => {
    const { stdout } = await execa('git', ['rev-parse', '--is-inside-work-tree'], { reject: false, cwd: cwd });

    if (stdout !== 'true') {
        return false;
    }

    return true;
};

const excludeFromDiff = (path: string) => `:(exclude)${path}`;

const filesToExclude = [
    'package-lock.json',
    'pnpm-lock.yaml',

    // yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
    '*.lock',
].map(excludeFromDiff);

export const getStagedDiff = async (excludeFiles?: string[]) => {
    const diffCached = ['diff', '--cached'];
    const { stdout: files } = await execa(
        'git',
        [
            ...diffCached,
            '--name-only',
            ...filesToExclude,
            ...(
                excludeFiles
                    ? excludeFiles.map(excludeFromDiff)
                    : []
            ),
        ],
        {
            cwd: cwd,
        }
    );

    if (!files) {
        return;
    }

    const { stdout: diff } = await execa(
        'git',
        [
            ...diffCached,
            ...filesToExclude,
        ],
        {
            cwd: cwd,
        }
    );

    return {
        files: files.split('\n'),
        diff,
    };
};

export const getDetectedMessage = (files: string[]) => `Detected ${files.length.toLocaleString()} staged file${files.length > 1 ? 's' : ''}`;