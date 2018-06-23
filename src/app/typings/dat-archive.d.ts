declare class DatArchive {

  static selectArchive(opts: any): Promise<DatArchive>;

  static create(opts: any): Promise<DatArchive>;

  constructor(datUrl: String);

  url: string;

  /**
   * @param data there're rules on the allowable types of this parameter; check the docs.
   */
  writeFile(path: string, data, opts?: { encoding?: string }): Promise<void>;

  /**
   * @param data there're rules on the allowable types of this parameter; check the docs.
   */
  writeFile(path: string, data, encoding?: string): Promise<void>;

  /**
   * There're rules for when a string is returned is returned. Check the docs.
   * 
   * I wish I could write it using dependent types.
   */
  readFile(path: string, opts?: { encoding?: string, timeout?: number }): Promise<string>;

  /**
   * There're rules for when an ArrayBuffer is returned is returned. Check the docs.
   */
  readFile(path: string, opts?: { encoding?: string, timeout?: number }): Promise<ArrayBuffer>;

  unlink(path: string): Promise<void>;
}
