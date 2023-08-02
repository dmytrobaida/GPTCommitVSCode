import { z } from "zod";
import * as vscode from "vscode";

const configuration = vscode.workspace.getConfiguration("gptcommit");

const configurationSchema = z.object({
  openAI: z.object({
    apiKey: z.string().optional(),
  }),
  appearance: z.object({
    delimeter: z.string().optional(),
  }),
});

type Configuration = z.infer<typeof configurationSchema>;

type DeepKey<T> = T extends object
  ? {
      [K in keyof T]-?: `${K & string}${T[K] extends object
        ? "."
        : ""}${DeepKey<T[K]>}`;
    }[keyof T]
  : "";

type ConfigurationKey = DeepKey<Configuration>;

export async function setConfigurationValue(key: ConfigurationKey, value: any) {
  await configuration.update(key, value, vscode.ConfigurationTarget.Global);
}

export default configurationSchema.parse(configuration);
