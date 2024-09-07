export type Some<T> = NonNullable<T>;
export type None = null | undefined;
export type Maybe<T> = Some<T> | None;

export namespace Maybe {
  export function from<T>(value: T): Maybe<T> {
    return value ?? null;
  }
  export function isSome<T>(value: Maybe<T>): value is Some<T> {
    return value !== null && value !== undefined;
  }
  export function isNone<T>(value: Maybe<T>): value is None {
    return value === null || value === undefined;
  }

  export const None: None = null;
  export function Some<T extends NonNullable<unknown>>(value: T): Some<T> {
    return value;
  }
}
