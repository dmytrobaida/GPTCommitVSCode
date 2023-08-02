/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/generateCommitMessageFromGitDiff.ts.
 */

import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";

import { trimNewLines } from "@utils/text";
import { Configuration as AppConfiguration } from "@utils/configuration";

import { MsgGenerator } from "./msg-generator";

const initMessagesPrompt: Array<ChatCompletionRequestMessage> = [
  {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: `You are to act as the author of a commit message in git. Your mission is to create clean and comprehensive commit messages in the conventional commit convention. I'll send you an output of 'git diff --staged' command, and you convert it into a commit message. Do not preface the commit with anything, use the present tense. Don't add any descriptions to the commit, only commit message. Use english language to answer.`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `diff --git a/src/server.ts b/src/server.ts
    index ad4db42..f3b18a9 100644
    --- a/src/server.ts
    +++ b/src/server.ts
    @@ -10,7 +10,7 @@ import {
      initWinstonLogger();
      
      const app = express();
    -const port = 7799;
    +const PORT = 7799;
      
      app.use(express.json());
      
    @@ -34,6 +34,6 @@ app.use((_, res, next) => {
      // ROUTES
      app.use(PROTECTED_ROUTER_URL, protectedRouter);
      
    -app.listen(port, () => {
    -  console.log(\`Server listening on port \${port}\`);
    +app.listen(process.env.PORT || PORT, () => {
    +  console.log(\`Server listening on port \${PORT}\`);
      });`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `fix(server.ts): change port variable case from lowercase port to uppercase PORT
        feat(server.ts): add support for process.env.PORT environment variable`,
  },
];

function generateCommitMessageChatCompletionPrompt(
  diff: string
): Array<ChatCompletionRequestMessage> {
  const chatContextAsCompletionRequest = [...initMessagesPrompt];

  chatContextAsCompletionRequest.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: diff,
  });

  return chatContextAsCompletionRequest;
}

const defaultModel = "gpt-3.5-turbo";
const defaultTemperature = 0.2;
const defaultMaxTokens = 196;

export class ChatgptMsgGenerator implements MsgGenerator {
  openAI: OpenAIApi;
  config?: AppConfiguration["openAI"];

  constructor(config: AppConfiguration["openAI"]) {
    this.openAI = new OpenAIApi(
      new Configuration({
        apiKey: config.apiKey,
      }),
      config.customEndpoint?.trim() || undefined
    );
    this.config = config;
  }

  async generate(diff: string, delimeter?: string) {
    const messages = generateCommitMessageChatCompletionPrompt(diff);
    const { data } = await this.openAI.createChatCompletion({
      model: this.config?.gptVersion || defaultModel,
      messages: messages,
      temperature: this.config?.temperature || defaultTemperature,
      ["max_tokens"]: this.config?.maxTokens || defaultMaxTokens,
    });

    const message = data?.choices[0].message;
    const commitMessage = message?.content;

    if (!commitMessage) {
      throw new Error("No commit message were generated. Try again.");
    }

    const alignedCommitMessage = trimNewLines(commitMessage, delimeter);
    return alignedCommitMessage;
  }
}
