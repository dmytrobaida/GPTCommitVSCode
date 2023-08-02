export interface Flow<T> {
  activate(): Promise<void>;
  run(props: T): Promise<void>;
}
