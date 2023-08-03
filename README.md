# GPT Commit

VS Code extension which helps to generate AI commit messages using ChatGPT.

## Features

You can generate commit message by pressing 'Generate AI commit' button in source control tab:

![Example of usage](assets/images/example.gif)

> Tip: You could also generate commit from command pallete by calling 'Generate AI commit' command.

## Requirements

You need Open AI API Key to make this extension work.
You can get your API key from [OpenAI](https://platform.openai.com/account/api-keys).

## Extension Settings

GPT Commit extension contributes the following settings:

### Appearance

- `gptcommit.appearance.delimeter`: Delimeter between commit lines

### General

- `gptcommit.general.generator`: Generator used to create commit messages. Available options: ChatGPT
- `gptcommit.general.messageApproveMethod`: Method used to approve generated commit message. Available options: Quick pick, Message file

### OpenAI

- `gptcommit.openAI.apiKey`: OpenAI API Key. Needed for generating AI commit messages
- `gptcommit.openAI.gptVersion`: Version of GPT used by OpenAI
- `gptcommit.openAI.customEndpoint`: Custom endpoint URL for OpenAI API
- `gptcommit.openAI.temperature`: Controls randomness. Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive
- `gptcommit.openAI.maxTokens`: The maximum number of tokens to generate. Requests can use up to 2048 tokens shared between prompt and completion

## Release Notes

### 1.0.0

Initial release of GPT Commit

### 1.0.1

Updated icons

### 1.0.2

Fixed UX

### 1.0.3

Added Open AI API Key input prompt

### 1.0.4

Updated commit formatting. Added new setting

### 1.0.5

Added new advanced configuration for ChatGPT.
Added new option to accept and edit generated commit via temp message file. (Thanks for help [chenweiyi](https://github.com/chenweiyi))
Added option to set custom ChatGPT endpoint URL. (Thanks for help [aiyogg](https://github.com/aiyogg))
Fixed issue with git on windows (Issue [#5](https://github.com/dmytrobaida/GPTCommitVSCode/issues/5))
Added option to select different ChatGPT version (Issue [#6](https://github.com/dmytrobaida/GPTCommitVSCode/issues/6))
Set default ChatGPT version to gpt-3.5-turbo-16k

## License

Released under [MIT](/LICENSE) by [@dmytrobaida](https://github.com/dmytrobaida).
