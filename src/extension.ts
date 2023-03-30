import * as vscode from 'vscode';

import generateAICommitMessage from './gptcommit';

async function getGitApi() {
	const gitEntension = vscode.extensions.getExtension('vscode.git');

	if (!gitEntension) {
		return;
	}

	if (!gitEntension.isActive) {
		await gitEntension.activate();
	}

	const gitApi = gitEntension.exports?.getAPI(1);

	return gitApi;
}

function getOpenAiApiKey() {
	const configuration = vscode.workspace.getConfiguration('gptcommit');
	const apiKey = configuration.get<string>('openAI.apiKey');
	return apiKey;
}

async function setRepositoryCommitMessage(commitMessage: string) {
	const gitApi = await getGitApi();
	const respository = gitApi?.repositories[0];

	if (!respository) {
		return;
	}

	respository.inputBox.value = commitMessage;
}

async function generateAICommitCommand() {
	const apiKey = getOpenAiApiKey();

	if (!apiKey) {
		vscode.window.showErrorMessage('You should set OpenAi Api Key in settings!');
		return;
	}

	const commitMessage = await generateAICommitMessage(apiKey);

	if (!commitMessage) {
		return;
	}

	await setRepositoryCommitMessage(commitMessage);
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('gptcommit.generateAICommit', generateAICommitCommand);
	context.subscriptions.push(disposable);
}

export function deactivate() { }
