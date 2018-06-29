export class Lockable<T> {
  constructor(
    readonly locked: boolean,
    readonly data: T
  ) { }
}
