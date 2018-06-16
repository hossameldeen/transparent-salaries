declare class DatArchive {
  static selectArchive(opts: any): Promise<DatArchive>;
  static create(opts: any): Promise<DatArchive>;
  constructor(datUrl: String);
  url: string;
}
