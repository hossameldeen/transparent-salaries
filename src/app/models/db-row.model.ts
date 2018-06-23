export class DBRow<T> {
  constructor(
    readonly uuid: string,
    readonly data: T
  ) { }
}
