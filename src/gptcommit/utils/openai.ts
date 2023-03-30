/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/api.ts.
 */

import { Configuration, OpenAIApi } from 'openai';

import { generateCommitMessageChatCompletionPrompt } from './completion';
import { trimNewLines } from './text';

export const generateCommitMessage = async (
    apiKey: string,
    diff: string,
    delimeter?: string,
) => {
    const messages = generateCommitMessageChatCompletionPrompt(diff);

    const openAI = new OpenAIApi(new Configuration({
        apiKey: apiKey
    }));

    const { data } = await openAI.createChatCompletion(
        {
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0,
            ['top_p']: 0.1,
            ['max_tokens']: 196
        }
    );

    const message = data?.choices[0].message;
    const commitMessage = message?.content;

    if (commitMessage) {
        const alignedCommitMessage = trimNewLines(commitMessage, delimeter);
        return alignedCommitMessage;
    }

    return;
};