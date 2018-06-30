export class Lockable<T> {
  constructor(
    readonly locked: boolean,
    readonly lockableData: T
  ) { }
}
