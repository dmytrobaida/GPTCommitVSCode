import * as vscode from "vscode";

import Configuration from "@utils/configuration";
import { GitExtension } from "@gptcommit/scm/types";
import { GitCommitMessageWriter, VscodeGitDiffProvider } from "@gptcommit/scm";
import { GenerateCompletionFlow } from "@flows";
import { ChatgptMsgGenerator } from "@gptcommit/commit-msg-gen";
import { runTaskWithTimeout } from "@utils/timer";

export async function generateAiCommitCommand() {
  try {
    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git");

    if (!gitExtension) {
      vscode.window.showErrorMessage("Git extension is not installed");
      return;
    }

    if (!gitExtension.isActive) {
      await gitExtension.activate();
    }

    let apiKey = Configuration.openAI.apiKey;

    if (!apiKey) {
      apiKey = await vscode.commands.executeCommand("setOpenaiApiKey");
    }

    if (!apiKey) {
      vscode.window.showErrorMessage(
        "You should set OpenAi API Key before using extension!"
      );
      return;
    }

    const commitMessageWriter = new GitCommitMessageWriter(gitExtension);
    const messageGenerator = new ChatgptMsgGenerator(apiKey);
    const diffProvider = new VscodeGitDiffProvider(gitExtension);

    const generateCompletionFlow = new GenerateCompletionFlow(
      messageGenerator,
      diffProvider,
      commitMessageWriter,
      vscode.window.showErrorMessage,
      async (message) => {
        const result = await vscode.window.showQuickPick(["Yes", "No"], {
          title: `Use this commit message?: ${message}`,
        });

        return result === "Yes";
      }
    );

    const delimeter = Configuration.appearance.delimeter;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        cancellable: false,
        title: "Generating AI Commit message",
      },
      async (progress) => {
        let increment = 0;

        runTaskWithTimeout(
          () => {
            progress.report({ increment: (increment += 1) });
          },
          5000,
          200
        );

        await generateCompletionFlow.run({ delimeter });
      }
    );
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error?.message;

    if (errorMessage) {
      await vscode.window.showErrorMessage(errorMessage);
      return;
    }

    await vscode.window.showErrorMessage(
      "Something went wrong. Please try again."
    );
    return;
  }
}
