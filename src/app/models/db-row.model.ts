export class DBRow<T> {
  constructor(
    readonly uuid: string,
    readonly dbRowData: T
  ) { }
}
