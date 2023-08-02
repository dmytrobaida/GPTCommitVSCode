export type DeepKey<T> = T extends object
  ? {
      [K in keyof T]-?: `${K & string}${T[K] extends object
        ? "."
        : ""}${DeepKey<T[K]>}`;
    }[keyof T]
  : "";
