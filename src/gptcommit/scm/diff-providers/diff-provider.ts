export interface DiffProvider {
  getStagedDiff: (excludeFiles?: string[]) => Promise<string>;
}
