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
    private readonly onError: (message: string) => Thenable<any>,
    private readonly onSelectMessage: (message: string) => Promise<boolean>
  ) {}

  activate(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async run(props: GenerateCompletionFlowProps): Promise<void> {
    const diff = await this.diffProvider.getStagedDiff();

    if (!diff || diff.trim() === "") {
      await this.onError(
        "No staged changes found. Make sure to stage your changes with `git add`."
      );
      return;
    }

    const commitMessage = await this.msgGenerator.generate(
      diff,
      props.delimeter
    );

    if (!commitMessage) {
      await this.onError("No commit message were generated. Try again.");
      return;
    }

    const result = await this.onSelectMessage(commitMessage);

    if (!result) {
      await this.onError("User rejected commit message.");
      return;
    }

    await this.commitMessageWriter.write(commitMessage);
  }
}
