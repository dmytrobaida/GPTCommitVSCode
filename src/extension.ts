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

async function setOpenAiApiKey(apiKey: string) {
	const configuration = vscode.workspace.getConfiguration('gptcommit');
	await configuration.update('openAI.apiKey', apiKey, vscode.ConfigurationTarget.Global);
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
	let apiKey = getOpenAiApiKey();

	if (!apiKey) {
		apiKey = await vscode.window.showInputBox({
			title: 'Please enter your OpenAi API Key',
		});

		if (!apiKey || apiKey.trim() === '') {
			vscode.window.showErrorMessage('You should set OpenAi API Key before extension using!');
			return;
		}

		await setOpenAiApiKey(apiKey);
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
