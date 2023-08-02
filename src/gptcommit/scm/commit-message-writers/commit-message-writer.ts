export interface CommitMessageWriter {
  write(message: string): Promise<void>;
}
