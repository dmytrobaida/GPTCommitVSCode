import * as vscode from "vscode";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import * as path from "path";

import { getConfiguration } from "@utils/configuration";
import { GitExtension } from "@gptcommit/scm/types";
import { GitCommitMessageWriter, VscodeGitDiffProvider } from "@gptcommit/scm";
import { GenerateCompletionFlow } from "@flows";
import { ChatgptMsgGenerator } from "@gptcommit/commit-msg-gen";
import { runTaskWithTimeout } from "@utils/timer";
import { logToOutputChannel } from "@utils/output";
import { isValidApiKey } from "@utils/text";

async function openTempFileWithMessage(message: string) {
  const uid = randomUUID();
  const tempMessageFile = path.join(tmpdir(), `vscode-gptcommit-${uid}.txt`);

  logToOutputChannel(`Opening temp file: ${tempMessageFile}`);

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(tempMessageFile),
    Buffer.from(message, "utf8")
  );

  const document = await vscode.workspace.openTextDocument(tempMessageFile);

  await vscode.window.showTextDocument(document, {
    preview: false,
  });

  let saveHandler: vscode.Disposable | undefined;
  let closeHandler: vscode.Disposable | undefined;

  const result = await new Promise<{
    result: boolean;
    edited: boolean;
    editedMessage?: string;
  }>((resolve) => {
    saveHandler = vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.fileName === tempMessageFile) {
        resolve({
          result: true,
          edited: true,
          editedMessage: doc.getText(),
        });
      }
    });

    closeHandler = vscode.window.onDidChangeVisibleTextEditors((editors) => {
      if (
        editors.every((editor) => editor.document.fileName !== tempMessageFile)
      ) {
        resolve({
          result: false,
          edited: false,
        });
      }
    });
  });

  logToOutputChannel(`Open file result: ${JSON.stringify(result)}`);

  saveHandler?.dispose();
  closeHandler?.dispose();

  logToOutputChannel(`Deleting temp file: ${tempMessageFile}`);
  await vscode.workspace.fs.delete(vscode.Uri.file(tempMessageFile));

  return result;
}

export async function generateAiCommitCommand() {
  try {
    logToOutputChannel("Starting generateAiCommitCommand");

    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git");

    if (!gitExtension) {
      throw new Error("Git extension is not installed");
    }

    if (!gitExtension.isActive) {
      logToOutputChannel("Activating git extension");
      await gitExtension.activate();
    }

    if (!isValidApiKey()) {
      logToOutputChannel("OpenAI API Key is not set. Asking user to set it.");
      await vscode.commands.executeCommand("gptcommit.setOpenAIApiKey");
    }

    if (!isValidApiKey()) {
      throw new Error("You should set OpenAi API Key before using extension!");
    }

    const configuration = getConfiguration();
    const commitMessageWriter = new GitCommitMessageWriter(gitExtension);
    const messageGenerator = new ChatgptMsgGenerator(configuration.openAI);
    const diffProvider = new VscodeGitDiffProvider(gitExtension);

    const generateCompletionFlow = new GenerateCompletionFlow(
      messageGenerator,
      diffProvider,
      commitMessageWriter,
      async (message) => {
        switch (configuration.general.messageApproveMethod) {
          case "Quick pick":
            const quickPickResult = await vscode.window.showQuickPick(
              ["Yes", "No"],
              {
                title: `Use this commit message?: ${message}`,
              }
            );

            return {
              result: quickPickResult === "Yes",
              edited: false,
            };
          case "Message file":
            const openFileResult = await openTempFileWithMessage(message);
            return openFileResult;
          default:
            return {
              result: true,
              edited: false,
            };
        }
      }
    );

    const delimeter = configuration.appearance.delimeter;

    logToOutputChannel("Running generateCompletionFlow");

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
    if (error.isAxiosError && error.response?.data?.error?.message) {
      logToOutputChannel(
        `OpenAI API error: ${error.response.data.error.message}`
      );
      vscode.window.showErrorMessage(
        `OpenAI API error: ${error.response.data.error.message}`
      );
      return;
    }

    if (error instanceof Error) {
      logToOutputChannel(`Error: ${error.message}`);
      vscode.window.showErrorMessage(error.message);
      return;
    }

    logToOutputChannel(`Something went wrong. Please try again.`);
    vscode.window.showErrorMessage("Something went wrong. Please try again.");
    return;
  }
}
