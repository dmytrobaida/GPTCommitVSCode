import * as vscode from "vscode";

import { setConfigurationValue } from "@utils/configuration";

export async function setOpenaiApiKey() {
  const apiKey = await vscode.window.showInputBox({
    title: "Please enter your OpenAi API Key",
  });

  if (!apiKey || apiKey.trim() === "") {
    return;
  }

  await setConfigurationValue("openAI.apiKey", apiKey);

  return apiKey;
}
