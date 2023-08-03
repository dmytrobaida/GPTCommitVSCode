import { MsgGenerator } from "@gptcommit/commit-msg-gen/generators/msg-generator";
import { DiffProvider } from "@gptcommit/scm/diff-providers/diff-provider";
import { CommitMessageWriter } from "@gptcommit/scm/commit-message-writers/commit-message-writer";

import { Flow } from "./flow";

type GenerateCompletionFlowProps = {
  delimeter?: string;
};

export class GenerateCompletionFlow
  implements Flow<GenerateCompletionFlowProps>
{
  constructor(
    private readonly msgGenerator: MsgGenerator,
    private readonly diffProvider: DiffProvider,
    private readonly commitMessageWriter: CommitMessageWriter,
    private readonly onSelectMessage: (message: string) => Promise<{
      result: boolean;
      edited: boolean;
      editedMessage?: string;
    }>
  ) {}

  activate(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async run(props: GenerateCompletionFlowProps): Promise<void> {
    const diff = await this.diffProvider.getStagedDiff();

    if (!diff || diff.trim() === "") {
      throw new Error(
        "No staged changes found. Make sure to stage your changes with `git add`."
      );
    }

    const commitMessage = await this.msgGenerator.generate(
      diff,
      props.delimeter
    );

    if (!commitMessage) {
      throw new Error("No commit message were generated. Try again.");
    }

    const { result, edited, editedMessage } = await this.onSelectMessage(
      commitMessage
    );

    if (!result) {
      throw new Error("User rejected commit message.");
    }

    if (edited && editedMessage != null && editedMessage.trim() !== "") {
      await this.commitMessageWriter.write(editedMessage);
    } else {
      await this.commitMessageWriter.write(commitMessage);
    }
  }
}
