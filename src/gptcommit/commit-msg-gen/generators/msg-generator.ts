export interface MsgGenerator {
  generate: (diff: string, delimeter?: string) => Promise<string>;
}
