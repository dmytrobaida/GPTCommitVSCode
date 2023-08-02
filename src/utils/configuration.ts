import { z } from "zod";
import * as vscode from "vscode";

import { DeepKey } from "./types";

const configurationSchema = z.object({
  openAI: z.object({
    apiKey: z.string().optional(),
    gptVersion: z
      .enum([
        "gpt-4",
        "gpt-4-0613",
        "gpt-4-32k",
        "gpt-4-32k-0613",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-0613",
        "gpt-3.5-turbo-16k",
        "gpt-3.5-turbo-16k-0613",
      ])
      .optional(),
    customUrl: z.string().optional(),
  }),
  appearance: z.object({
    delimeter: z.string().optional(),
  }),
  general: z.object({
    generator: z.enum(["ChatGPT", "Custom"]).optional(),
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;

export async function setConfigurationValue(
  key: DeepKey<Configuration>,
  value: any
) {
  const configuration = vscode.workspace.getConfiguration("gptcommit");
  await configuration.update(key, value, vscode.ConfigurationTarget.Global);
}

export function getConfiguration() {
  const configuration = vscode.workspace.getConfiguration("gptcommit");
  return configurationSchema.parse(configuration);
}
